'use client'

import { Id } from '@/convex/_generated/dataModel'
import { Activity, CanvasItemData, Script } from './canvas-board'
import DraggableCanvasItem from './draggable-canvas-item'

const CELL_SIZE = 100
const GRID_COLS = 20
const GRID_ROWS = 20

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
	return (
		<div
			className="flex-1 overflow-auto"
			onClick={() => onSelect(null)}
		>
			<div
				className="relative"
				style={{
					width: GRID_COLS * CELL_SIZE,
					height: GRID_ROWS * CELL_SIZE,
					backgroundImage: `
						linear-gradient(to right, #e2e8f0 1px, transparent 1px),
						linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
					`,
					backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
					backgroundColor: '#fafafa',
				}}
			>
				{items.length === 0 && (
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<p className="text-gray-300 text-lg font-medium">
							Tap items below to add them here
						</p>
					</div>
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
						gridCols={GRID_COLS}
						gridRows={GRID_ROWS}
						cellSize={CELL_SIZE}
					/>
				))}
			</div>
		</div>
	)
}
