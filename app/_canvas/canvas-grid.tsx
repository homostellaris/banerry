'use client'

import { Id } from '@/convex/_generated/dataModel'
import { useMemo } from 'react'
import { Activity, CanvasItemData, Script } from './canvas-board'
import DraggableCanvasItem from './draggable-canvas-item'

const CELL_SIZE = 100
const MIN_GRID_SIZE = 20 // Minimum visible grid cells

/**
 * Calculate the bounds of the canvas based on placed items.
 * Adds padding around items to allow room for interaction.
 */
function calculateCanvasBounds(items: CanvasItemData[], minSize: number) {
	if (items.length === 0) {
		return { minX: 0, minY: 0, maxX: minSize, maxY: minSize }
	}

	const xs = items.map(item => item.gridX)
	const ys = items.map(item => item.gridY)
	const minX = Math.min(0, Math.min(...xs) - 2) // 2 cell padding
	const minY = Math.min(0, Math.min(...ys) - 2)
	const maxX = Math.max(minSize, Math.max(...xs) + 3) // Account for item width + padding
	const maxY = Math.max(minSize, Math.max(...ys) + 3)

	return { minX, minY, maxX, maxY }
}

export default function CanvasGrid({
	items,
	activities,
	scripts,
	selectedItemId,
	onSelect,
	onMove,
	onRemove,
}: {
	items: CanvasItemData[]
	activities: Activity[]
	scripts: Script[]
	selectedItemId: Id<'canvasItems'> | null
	onSelect: (id: Id<'canvasItems'> | null) => void
	onMove: (id: Id<'canvasItems'>, gridX: number, gridY: number) => void
	onRemove: (id: Id<'canvasItems'>) => void
}) {
	// Calculate dynamic canvas bounds based on content
	const { minX, minY, maxX, maxY } = useMemo(
		() => calculateCanvasBounds(items, MIN_GRID_SIZE),
		[items],
	)

	const canvasWidth = (maxX - minX) * CELL_SIZE
	const canvasHeight = (maxY - minY) * CELL_SIZE

	return (
		<div
			className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100"
			onClick={() => onSelect(null)}
			// Touch scroll optimization: use passive listeners
			onTouchMove={(e) => {
				// Allow natural scrolling
			}}
		>
			<div
				className="relative select-none"
				style={{
					width: canvasWidth,
					height: canvasHeight,
					// Grid pattern: repeating lines at CELL_SIZE intervals
					backgroundImage: `
						linear-gradient(to right, #d1d5db 1px, transparent 1px),
						linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
					`,
					backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
					backgroundPosition: `${minX * CELL_SIZE}px ${minY * CELL_SIZE}px`,
					backgroundColor: '#ffffff',
					// Prevent text selection during drag
					WebkitUserSelect: 'none',
				userSelect: 'none',
				// Improve touch performance
				WebkitTouchCallout: 'none',
			}}
			>
				{items.length === 0 && (
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<div className="text-center">
							<p className="text-gray-400 text-lg font-medium mb-2">Your Canvas</p>
							<p className="text-gray-300 text-sm">Tap items below to create</p>
						</div>
					</div>
				)}

				{/* Render all canvas items with absolute positioning */}
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
						cellSize={CELL_SIZE}
						// Pass bounds so items know valid placement area
						minGridX={minX}
						minGridY={minY}
						maxGridX={maxX}
						maxGridY={maxY}
					/>
				))}
			</div>
		</div>
	)
}
