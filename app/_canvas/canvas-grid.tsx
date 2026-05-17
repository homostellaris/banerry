'use client'

import { Id } from '@/convex/_generated/dataModel'
import { useMemo } from 'react'
import { Activity, CanvasItemData, Script } from './canvas-board'
import { CELL_SIZE } from './constants'
import DraggableCanvasItem from './draggable-canvas-item'

const MIN_GRID_SIZE = 20

function calculateCanvasBounds(items: CanvasItemData[], minSize: number) {
	if (items.length === 0) return { maxX: minSize, maxY: minSize }
	const maxX = Math.max(minSize, Math.max(...items.map(i => i.gridX)) + 3)
	const maxY = Math.max(minSize, Math.max(...items.map(i => i.gridY)) + 3)
	return { maxX, maxY }
}

export default function CanvasGrid({
	items,
	activities,
	scripts,
	selectedItemId,
	onSelect,
	onMove,
	onRemove,
	onTap,
	containerRef,
	dropPreview,
}: {
	items: CanvasItemData[]
	activities: Activity[]
	scripts: Script[]
	selectedItemId: Id<'canvasItems'> | null
	onSelect: (id: Id<'canvasItems'> | null) => void
	onMove: (id: Id<'canvasItems'>, gridX: number, gridY: number) => void
	onRemove: (id: Id<'canvasItems'>) => void
	onTap: (item: CanvasItemData) => void
	containerRef: { current: HTMLDivElement | null }
	dropPreview: { gridX: number; gridY: number } | null
}) {
	const { maxX, maxY } = useMemo(
		() => calculateCanvasBounds(items, MIN_GRID_SIZE),
		[items],
	)

	const canvasWidth = maxX * CELL_SIZE
	const canvasHeight = maxY * CELL_SIZE

	return (
		<div
			ref={containerRef}
			data-testid="canvas-container"
			className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100"
			onPointerDown={(e: any) => {
				// Only deselect if clicking directly on the container, not on a child
				if (e.target === e.currentTarget) onSelect(null)
			}}
		>
			<div
				data-testid="canvas-grid"
				className="relative select-none"
				tabIndex={0}
				style={{
					width: canvasWidth,
					height: canvasHeight,
					backgroundImage: `
						linear-gradient(to right, #d1d5db 1px, transparent 1px),
						linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
					`,
					backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
					backgroundColor: '#ffffff',
					WebkitUserSelect: 'none',
					userSelect: 'none',
					WebkitTouchCallout: 'none',
				}}
			>
				{items.length === 0 && !dropPreview && (
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<div className="text-center">
							<p className="text-gray-400 text-lg font-medium mb-2">Your Canvas</p>
							<p className="text-gray-300 text-sm">Drag items from below to create</p>
						</div>
					</div>
				)}

				{/* Drop preview cell highlight */}
				{dropPreview && (
					<div
						className="absolute rounded-md border-2 border-brand bg-brand/10 pointer-events-none"
						style={{
							left: dropPreview.gridX * CELL_SIZE + 2,
							top: dropPreview.gridY * CELL_SIZE + 2,
							width: CELL_SIZE - 4,
							height: CELL_SIZE - 4,
							zIndex: 50,
						}}
					/>
				)}

				{items.map(item => (
					<DraggableCanvasItem
						key={item._id}
						item={item}
						activities={activities}
						scripts={scripts}
						isSelected={selectedItemId === item._id}
						onSelect={onSelect}
						onMove={onMove}
						onRemove={onRemove}
						onTap={onTap}
						cellSize={CELL_SIZE}
					/>
				))}
			</div>
		</div>
	)
}
