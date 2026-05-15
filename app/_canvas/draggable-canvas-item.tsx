'use client'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Activity, CanvasItemData, Script } from './canvas-board'
import { DRAG_THRESHOLD } from './constants'

export default function DraggableCanvasItem({
	item,
	activities,
	scripts,
	isSelected,
	onSelect,
	onMove,
	onRemove,
	cellSize,
}: {
	item: CanvasItemData
	activities: Activity[]
	scripts: Script[]
	isSelected: boolean
	onSelect: (id: Id<'canvasItems'> | null) => void
	onMove: (id: Id<'canvasItems'>, gridX: number, gridY: number) => void
	onRemove: (id: Id<'canvasItems'>) => void
	cellSize: number
}) {
	const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const pointerDownRef = useRef<{ pointerX: number; pointerY: number } | null>(null)
	const hasDraggedRef = useRef(false)

	const visualLeft = item.gridX * cellSize + (isDragging ? dragDelta.x : 0)
	const visualTop = item.gridY * cellSize + (isDragging ? dragDelta.y : 0)

	function handlePointerDown(e: any) {
		e.stopPropagation()
		e.currentTarget.setPointerCapture(e.pointerId)
		pointerDownRef.current = { pointerX: e.clientX, pointerY: e.clientY }
		hasDraggedRef.current = false
		setDragDelta({ x: 0, y: 0 })
	}

	function handlePointerMove(e: any) {
		if (!pointerDownRef.current) return
		const dx = e.clientX - pointerDownRef.current.pointerX
		const dy = e.clientY - pointerDownRef.current.pointerY
		const dist = Math.sqrt(dx * dx + dy * dy)
		if (dist > DRAG_THRESHOLD || hasDraggedRef.current) {
			hasDraggedRef.current = true
			setIsDragging(true)
			setDragDelta({ x: dx, y: dy })
		}
	}

	function handlePointerUp() {
		if (!pointerDownRef.current) return

		if (hasDraggedRef.current) {
			const newGridX = Math.max(0, Math.round(item.gridX + dragDelta.x / cellSize))
			const newGridY = Math.max(0, Math.round(item.gridY + dragDelta.y / cellSize))
			onMove(item._id, newGridX, newGridY)
		} else {
			onSelect(isSelected ? null : item._id)
		}

		pointerDownRef.current = null
		hasDraggedRef.current = false
		setIsDragging(false)
		setDragDelta({ x: 0, y: 0 })
	}

	return (
		<div
			data-testid="canvas-item"
			data-x={item.gridX}
			data-y={item.gridY}
			data-selected={isSelected}
			data-snapped="true"
			className={`absolute rounded-lg overflow-hidden border-2 transition-all ${
				isSelected ? 'border-brand shadow-lg' : 'border-transparent shadow-md'
			} ${isDragging ? 'shadow-2xl' : ''}`}
			style={{
				left: visualLeft + 2,
				top: visualTop + 2,
				width: cellSize - 4,
				height: cellSize - 4,
				zIndex: isDragging ? 100 : isSelected ? 10 : 1,
				touchAction: 'none',
				cursor: isDragging ? 'grabbing' : 'grab',
				userSelect: 'none',
				transition: isDragging ? 'none' : 'box-shadow 0.2s ease, border-color 0.2s ease',
			}}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			// Prevent synthetic click from bubbling to canvas and deselecting immediately
			onClick={e => e.stopPropagation()}
		>
			<ItemContent item={item} activities={activities} scripts={scripts} />
			{isSelected && (
				<button
					data-testid="delete-item"
					className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10"
					onPointerDown={e => e.stopPropagation()}
					onClick={e => {
						e.stopPropagation()
						onRemove(item._id)
					}}
				>
					<X className="w-3 h-3" />
				</button>
			)}
		</div>
	)
}

function ItemContent({
	item,
	activities,
	scripts,
}: {
	item: CanvasItemData
	activities: Activity[]
	scripts: Script[]
}) {
	if (item.type === 'activity') {
		return <ActivityContent sourceId={item.sourceId ?? ''} activities={activities} />
	}
	if (item.type === 'script') {
		const script = scripts.find(s => (s._id as string) === item.sourceId)
		return <ScriptContent script={script} />
	}
	return <ColorContent color={item.color ?? '#74B9FF'} />
}

function ActivityContent({
	sourceId,
	activities,
}: {
	sourceId: string
	activities: Activity[]
}) {
	const activity = activities.find(a => a.id === sourceId)
	const imageUrl = useQuery(
		api.boards.getImageUrl,
		activity?.imageStorageId ? { storageId: activity.imageStorageId } : 'skip',
	)

	return (
		<div className="w-full h-full relative bg-gray-100">
			{imageUrl ? (
				<img
					src={imageUrl}
					alt={activity?.title}
					className="w-full h-full object-cover"
					draggable={false}
				/>
			) : (
				<div className="w-full h-full flex items-center justify-center">
					<div className="w-6 h-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
				</div>
			)}
			{activity?.title && (
				<div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-0.5 px-1 truncate">
					{activity.title}
				</div>
			)}
		</div>
	)
}

function ScriptContent({ script }: { script?: Script }) {
	return (
		<div className="w-full h-full bg-brand/10 flex items-center justify-center p-2">
			<p className="text-xs text-center text-gray-700 line-clamp-4 leading-tight">
				{script?.dialogue ?? '…'}
			</p>
		</div>
	)
}

function ColorContent({ color }: { color: string }) {
	return <div className="w-full h-full" style={{ backgroundColor: color }} />
}
