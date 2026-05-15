'use client'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { ImageIcon, MessageSquare } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CanvasGrid from './canvas-grid'
import CanvasPalette from './canvas-palette'
import { CELL_SIZE } from './constants'

export interface Activity {
	id: string
	title: string
	imageStorageId?: Id<'_storage'>
}

export interface Script {
	_id: Id<'scripts'>
	dialogue: string
	parentheticals: string
}

export interface CanvasItemData {
	_id: Id<'canvasItems'>
	type: 'activity' | 'script' | 'color'
	sourceId?: string
	gridX: number
	gridY: number
	color?: string
}

export interface PaletteDragState {
	type: 'activity' | 'script' | 'color'
	sourceId?: string
	color?: string
	clientX: number
	clientY: number
}

function findFreeCell(
	items: CanvasItemData[],
	cols: number,
	rows: number,
): { x: number; y: number } {
	const occupied = new Set(items.map(i => `${i.gridX},${i.gridY}`))
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			if (!occupied.has(`${col},${row}`)) return { x: col, y: row }
		}
	}
	return { x: 0, y: 0 }
}

export default function CanvasBoard({
	learnerId,
}: {
	learnerId: Id<'learners'>
}) {
	const [selectedItemId, setSelectedItemId] = useState<Id<'canvasItems'> | null>(null)
	const [paletteDrag, setPaletteDrag] = useState<PaletteDragState | null>(null)
	const [dropPreview, setDropPreview] = useState<{ gridX: number; gridY: number } | null>(null)
	const canvasContainerRef = useRef<HTMLDivElement>(null)

	const canvasItems = useQuery(api.canvas.listItems, { learnerId })
	const boards = useQuery(api.boards.getBoards, { learnerId })
	const scripts = useQuery(api.scripts.list, { learnerId })

	const addItemMutation = useMutation(api.canvas.addItem)
	const moveItemMutation = useMutation(api.canvas.moveItem)
	const removeItemMutation = useMutation(api.canvas.removeItem)

	// Include all board columns, not just those with images
	const activities: Activity[] = boards
		? boards.flatMap(board =>
				board.columns.map(col => ({
					id: `${board._id}-${col.id}`,
					title: col.title,
					imageStorageId: col.imageStorageId as Id<'_storage'> | undefined,
				})),
			)
		: []

	async function handleAddItem(
		type: 'activity' | 'script' | 'color',
		sourceId?: string,
		color?: string,
	) {
		const items = canvasItems ?? []
		const { x, y } = findFreeCell(items, 50, 50)
		await addItemMutation({ learnerId, type, sourceId, gridX: x, gridY: y, color })
	}

	async function handleMoveItem(
		itemId: Id<'canvasItems'>,
		gridX: number,
		gridY: number,
	) {
		await moveItemMutation({ itemId, gridX, gridY })
	}

	async function handleRemoveItem(itemId: Id<'canvasItems'>) {
		setSelectedItemId(null)
		await removeItemMutation({ itemId })
	}

	function getGridPosition(clientX: number, clientY: number): { gridX: number; gridY: number } | null {
		const container = canvasContainerRef.current
		if (!container) return null
		const rect = container.getBoundingClientRect()
		if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
			return null
		}
		const canvasX = clientX - rect.left + container.scrollLeft
		const canvasY = clientY - rect.top + container.scrollTop
		return {
			gridX: Math.max(0, Math.round(canvasX / CELL_SIZE)),
			gridY: Math.max(0, Math.round(canvasY / CELL_SIZE)),
		}
	}

	function handlePaletteDragStart(
		type: 'activity' | 'script' | 'color',
		clientX: number,
		clientY: number,
		sourceId?: string,
		color?: string,
	) {
		setPaletteDrag({ type, sourceId, color, clientX, clientY })
	}

	function handlePaletteDragMove(clientX: number, clientY: number) {
		setPaletteDrag((prev: PaletteDragState | null) => (prev ? { ...prev, clientX, clientY } : null))
		setDropPreview(getGridPosition(clientX, clientY))
	}

	async function handlePaletteDragEnd(clientX: number, clientY: number) {
		const drag = paletteDrag
		setPaletteDrag(null)
		setDropPreview(null)
		if (!drag) return

		const pos = getGridPosition(clientX, clientY)
		if (pos) {
			await addItemMutation({
				learnerId,
				type: drag.type,
				sourceId: drag.sourceId,
				gridX: pos.gridX,
				gridY: pos.gridY,
				color: drag.color,
			})
		}
	}

	if (!canvasItems) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
			</div>
		)
	}

	return (
		<div className="flex flex-col h-full">
			<CanvasGrid
				items={canvasItems}
				activities={activities}
				scripts={scripts ?? []}
				selectedItemId={selectedItemId}
				onSelect={setSelectedItemId}
				onMove={handleMoveItem}
				onRemove={handleRemoveItem}
				containerRef={canvasContainerRef}
				dropPreview={dropPreview}
			/>
			<CanvasPalette
				activities={activities}
				scripts={scripts ?? []}
				onAdd={handleAddItem}
				onDragStart={handlePaletteDragStart}
				onDragMove={handlePaletteDragMove}
				onDragEnd={handlePaletteDragEnd}
			/>
			{paletteDrag &&
				typeof window !== 'undefined' &&
				createPortal(
					<div
						style={{
							position: 'fixed',
							left: paletteDrag.clientX - CELL_SIZE / 2,
							top: paletteDrag.clientY - CELL_SIZE / 2,
							width: CELL_SIZE - 4,
							height: CELL_SIZE - 4,
							opacity: 0.85,
							pointerEvents: 'none',
							zIndex: 9999,
							borderRadius: 8,
							boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
							overflow: 'hidden',
						}}
					>
						<DragGhost drag={paletteDrag} activities={activities} scripts={scripts ?? []} />
					</div>,
					document.body,
				)}
		</div>
	)
}

function DragGhost({
	drag,
	activities,
	scripts,
}: {
	drag: PaletteDragState
	activities: Activity[]
	scripts: Script[]
}) {
	if (drag.type === 'color') {
		return (
			<div style={{ width: '100%', height: '100%', backgroundColor: drag.color, borderRadius: 8 }} />
		)
	}
	if (drag.type === 'activity') {
		const activity = activities.find(a => a.id === drag.sourceId)
		return (
			<div
				style={{
					width: '100%',
					height: '100%',
					background: '#e2e8f0',
					borderRadius: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					position: 'relative',
				}}
			>
				<ImageIcon style={{ width: 32, height: 32, color: '#94a3b8' }} />
				{activity?.title && (
					<div
						style={{
							position: 'absolute',
							bottom: 0,
							left: 0,
							right: 0,
							background: 'rgba(0,0,0,0.5)',
							color: 'white',
							fontSize: 10,
							padding: '2px 4px',
							overflow: 'hidden',
							whiteSpace: 'nowrap',
							textOverflow: 'ellipsis',
						}}
					>
						{activity.title}
					</div>
				)}
			</div>
		)
	}
	const script = scripts.find(s => (s._id as string) === drag.sourceId)
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				background: '#ede9fe',
				borderRadius: 8,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 8,
			}}
		>
			{script ? (
				<p
					style={{
						fontSize: 10,
						textAlign: 'center',
						color: '#374151',
						overflow: 'hidden',
						display: '-webkit-box',
						WebkitLineClamp: 4,
						WebkitBoxOrient: 'vertical',
					}}
				>
					{script.dialogue}
				</p>
			) : (
				<MessageSquare style={{ width: 32, height: 32, color: '#7c3aed' }} />
			)}
		</div>
	)
}
