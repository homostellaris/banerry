'use client'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import CanvasGrid from './canvas-grid'
import CanvasPalette from './canvas-palette'

const GRID_COLS = 20
const GRID_ROWS = 20

export interface Activity {
	id: string
	title: string
	imageStorageId: Id<'_storage'>
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

	const canvasItems = useQuery(api.canvas.listItems, { learnerId })
	const boards = useQuery(api.boards.getBoards, { learnerId })
	const scripts = useQuery(api.scripts.list, { learnerId })

	const addItemMutation = useMutation(api.canvas.addItem)
	const moveItemMutation = useMutation(api.canvas.moveItem)
	const removeItemMutation = useMutation(api.canvas.removeItem)

	const activities: Activity[] = boards
		? boards.flatMap(board =>
				board.columns
					.filter(col => col.imageStorageId)
					.map(col => ({
						id: `${board._id}-${col.id}`,
						title: col.title,
						imageStorageId: col.imageStorageId as Id<'_storage'>,
					})),
			)
		: []

	async function handleAddItem(
		type: 'activity' | 'script' | 'color',
		sourceId?: string,
		color?: string,
	) {
		const items = canvasItems ?? []
		const { x, y } = findFreeCell(items, GRID_COLS, GRID_ROWS)
		await addItemMutation({ learnerId, type, sourceId, gridX: x, gridY: y, color })
	}

	async function handleMoveItem(
		itemId: Id<'canvasItems'>,
		gridX: number,
		gridY: number,
	) {
		const items = canvasItems ?? []
		const occupied = new Set(
			items.filter(i => i._id !== itemId).map(i => `${i.gridX},${i.gridY}`),
		)
		if (!occupied.has(`${gridX},${gridY}`)) {
			await moveItemMutation({ itemId, gridX, gridY })
		}
	}

	async function handleRemoveItem(itemId: Id<'canvasItems'>) {
		setSelectedItemId(null)
		await removeItemMutation({ itemId })
	}

	if (!canvasItems) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
			</div>
		)
	}

	return (
		<>
			<CanvasGrid
				items={canvasItems}
				activities={activities}
				scripts={scripts ?? []}
				selectedItemId={selectedItemId}
				onSelect={setSelectedItemId}
				onMove={handleMoveItem}
				onRemove={handleRemoveItem}
			/>
			<CanvasPalette
				activities={activities}
				scripts={scripts ?? []}
				onAdd={handleAddItem}
			/>
		</>
	)
}
