'use client'

import React, { useRef, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { CanvasCarouselProps, CanvasBlock, CANVAS_DATA_NAMES } from './types'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

function StorageImagePreview({ storageId }: { storageId: Id<'_storage'> | string }) {
	const imageUrl = useQuery(
		api.boards.getImageUrl,
		storageId ? { storageId: storageId as Id<'_storage'> } : 'skip',
	)

	if (!imageUrl) {
		return (
			<div className="w-full h-full bg-gray-100 rounded border flex items-center justify-center">
				<div className="animate-spin rounded-full h-3 w-3 border-b border-brand"></div>
			</div>
		)
	}

	return (
		<img
			src={imageUrl}
			alt="Activity preview"
			data-name="activity-preview-image"
			className="w-full h-full object-cover rounded"
		/>
	)
}

function getPreviewGridClasses(count: number): string {
	if (count <= 1) return 'grid-cols-1'
	if (count === 2) return 'grid-cols-2'
	return 'grid-cols-3'
}

function MiniCanvasPreview({ blocks = [] }: { blocks: CanvasBlock[] }) {
	const previewBlocks = blocks.slice(0, 6)

	if (previewBlocks.length === 0) {
		return (
			<div className="w-full h-20 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
				Empty Canvas
			</div>
		)
	}

	return (
		<div className={`grid gap-1 ${getPreviewGridClasses(previewBlocks.length)} overflow-hidden`}>
			{previewBlocks.map((b, idx) => (
				<div
					key={b.id || idx}
					className="aspect-square bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center text-xs font-semibold shadow-2xs relative"
				>
					{b.type === 'activity' ? (
						b.imageUrl ? (
							<img
								src={b.imageUrl}
								alt={b.content || 'Activity preview'}
								data-name="activity-preview-image"
								className="w-full h-full object-cover rounded"
							/>
						) : b.imageStorageId ? (
							<StorageImagePreview storageId={b.imageStorageId} />
						) : (
							<span className="text-base">🎯</span>
						)
					) : b.type === 'script' ? (
						<div className="w-full h-full bg-brand/5 border border-brand/20 p-1 flex items-center justify-center text-center">
							<span className="text-[10px] text-brand font-semibold truncate max-w-full leading-tight">
								💬 {b.content}
							</span>
						</div>
					) : b.type === 'emoji' ? (
						<span className="text-base">{b.content || '😀'}</span>
					) : b.type === 'letter' ? (
						<span className="text-xs font-bold text-blue-600 truncate px-0.5">{b.content || 'A'}</span>
					) : (
						<span className="text-xs font-bold text-purple-600 truncate px-0.5">{b.content || '1'}</span>
					)}
				</div>
			))}
		</div>
	)
}

export function CanvasCarousel({
	canvases,
	onSelectCanvas,
	onCreateNew,
	activeCanvasId,
	selectedCanvasId,
	onDeleteCanvas,
	readOnly = false,
}: CanvasCarouselProps) {
	const activeCardRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (activeCardRef.current) {
			activeCardRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'center',
			})
		}
	}, [activeCanvasId, selectedCanvasId, canvases.length])

	if (canvases.length === 0) {
		return (
			<div data-name={CANVAS_DATA_NAMES.CAROUSEL} className="w-full my-4">
				<div
					data-name={CANVAS_DATA_NAMES.EMPTY_PROMPT}
					className="flex flex-col items-center justify-center p-8 bg-brand/5 rounded-2xl border-2 border-dashed border-brand/20 text-center"
				>
					<h2 className="text-xl font-bold text-brand mb-2">
						{readOnly ? 'No Canvases Created Yet' : 'No Canvases Yet!'}
					</h2>
					<p className="text-sm text-gray-600 max-w-sm mb-6">
						{readOnly
							? 'Canvases created by the learner will appear here.'
							: 'Create your first canvas to express yourself with scripts, activities, emojis, letters, and numbers.'}
					</p>
					{!readOnly && (
						<Button
							type="button"
							data-name={CANVAS_DATA_NAMES.CREATE_CANVAS_BTN}
							onClick={onCreateNew}
							className="bg-brand hover:bg-brand/90 text-white font-bold rounded-xl shadow-md transition-colors"
						>
							Create First Canvas
						</Button>
					)}
				</div>
			</div>
		)
	}

	return (
		<div data-name={CANVAS_DATA_NAMES.CAROUSEL} className="w-full my-4">
			<div className="flex items-center justify-between mb-3">
				<h2 className="text-lg font-bold text-gray-800">
					{readOnly ? "Learner's Canvases" : 'Your Canvases'}
				</h2>
				{!readOnly && (
					<Button
						type="button"
						size="sm"
						variant="outline"
						data-name={CANVAS_DATA_NAMES.CREATE_CANVAS_BTN}
						onClick={onCreateNew}
						className="shrink-0"
					>
						<Plus className="h-4 w-4 mr-1.5" /> New Canvas
					</Button>
				)}
			</div>
			<div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-thin">
				{canvases.map(canvas => {
					const canvasIdStr = canvas._id ? canvas._id.toString() : ''
					const isActive =
						Boolean(activeCanvasId && canvasIdStr && activeCanvasId.toString() === canvasIdStr) ||
						Boolean(selectedCanvasId && canvasIdStr && selectedCanvasId.toString() === canvasIdStr)

					return (
						<div
							key={canvasIdStr || Math.random().toString()}
							ref={isActive ? activeCardRef : null}
							data-name={CANVAS_DATA_NAMES.CARD}
							onClick={() => onSelectCanvas(canvas)}
							className={`relative group w-full sm:w-auto min-w-[280px] sm:min-w-[240px] bg-white rounded-xl p-4 cursor-pointer flex flex-col justify-between snap-center transition-all hover:-translate-y-1 shrink-0 ${
								isActive
									? 'border-2 border-brand ring-2 ring-brand/20 shadow-md bg-brand/5'
									: 'border border-gray-200 shadow-sm hover:shadow-md'
							}`}
						>
							{!readOnly && onDeleteCanvas && (
								<button
									type="button"
									data-name={CANVAS_DATA_NAMES.DELETE_BTN}
									onClick={e => {
										e.stopPropagation()
										onDeleteCanvas(canvasIdStr)
									}}
									className="absolute top-2 right-2 text-xs text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 rounded hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
									title="Delete canvas"
								>
									×
								</button>
							)}

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-gray-800 truncate pr-4">
										{canvas.name}
									</h3>
									<span className="text-xs text-gray-500 shrink-0">
										{canvas.blocks.length}{' '}
										{canvas.blocks.length === 1 ? 'block' : 'blocks'}
									</span>
								</div>

								{/* Mini Canvas Block Preview */}
								<MiniCanvasPreview blocks={canvas.blocks} />
							</div>

							<div className="text-xs text-gray-400 mt-2">
								{new Date(canvas.createdAt).toLocaleDateString()}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
