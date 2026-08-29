'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { CanvasCarouselProps, CanvasBlock, CANVAS_DATA_NAMES } from './types'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from '@/components/ui/carousel'

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
	if (count === 3) return 'grid-cols-3'
	if (count === 4) return 'grid-cols-4'
	if (count === 5) return 'grid-cols-5'
	return 'grid-cols-6'
}

function MiniCanvasPreview({ blocks = [] }: { blocks: CanvasBlock[] }) {
	const previewBlocks = blocks.slice(0, 6)

	if (previewBlocks.length === 0) {
		return (
			<div className="w-full h-16 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
				Empty Canvas
			</div>
		)
	}

	return (
		<div className="w-full h-16 flex items-center justify-center">
			<div
				className={`grid gap-1 w-full max-h-16 h-full ${getPreviewGridClasses(
					previewBlocks.length,
				)}`}
			>
				{previewBlocks.map((b, idx) => (
					<div
						key={b.id || idx}
						className="h-full aspect-square max-h-16 mx-auto bg-white rounded border border-gray-200 overflow-hidden flex items-center justify-center text-xs font-semibold shadow-2xs relative"
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
							<span className="text-xs font-bold text-blue-600 truncate px-0.5">
								{b.content || 'A'}
							</span>
						) : (
							<span className="text-xs font-bold text-purple-600 truncate px-0.5">
								{b.content || '1'}
							</span>
						)}
					</div>
				))}
			</div>
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
	const [api, setApi] = useState<CarouselApi>()

	useEffect(() => {
		if (!api) return
		const activeIndex = canvases.findIndex(c => {
			const cId = c._id ? c._id.toString() : ''
			return (
				Boolean(activeCanvasId && cId && activeCanvasId.toString() === cId) ||
				Boolean(selectedCanvasId && cId && selectedCanvasId.toString() === cId)
			)
		})
		if (activeIndex !== -1) {
			api.scrollTo(activeIndex)
		}
	}, [api, activeCanvasId, selectedCanvasId, canvases])

	if (canvases.length === 0) {
		return (
			<div data-name={CANVAS_DATA_NAMES.CAROUSEL} className="w-full max-w-4xl mx-auto mb-6">
				<Card className="border-dashed" data-name={CANVAS_DATA_NAMES.EMPTY_PROMPT}>
					<CardContent className="flex items-center justify-center py-8">
						<div className="text-center">
							<div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto mb-2 text-xl">
								🎨
							</div>
							<h2 className="text-lg font-bold text-gray-800 mb-1">
								{readOnly ? 'No Canvases Created Yet' : 'No Canvases Yet!'}
							</h2>
							<p className="text-sm text-gray-500 max-w-sm mb-4 mx-auto">
								{readOnly
									? 'Canvases created by the learner will appear here.'
									: 'Create your first canvas to express yourself with scripts, activities, emojis, letters, and numbers.'}
							</p>
							{!readOnly && (
								<Button
									type="button"
									size="sm"
									data-name={CANVAS_DATA_NAMES.CREATE_CANVAS_BTN}
									onClick={onCreateNew}
								>
									<Plus className="h-4 w-4 mr-2" />
									Create First Canvas
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div data-name={CANVAS_DATA_NAMES.CAROUSEL} className="w-full max-w-4xl mx-auto mb-6">
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

			<Carousel setApi={setApi} className="w-full">
				<CarouselContent className="-ml-2 md:-ml-4">
					{canvases.map(canvas => {
						const canvasIdStr = canvas._id ? canvas._id.toString() : ''
						const isActive =
							Boolean(activeCanvasId && canvasIdStr && activeCanvasId.toString() === canvasIdStr) ||
							Boolean(selectedCanvasId && canvasIdStr && selectedCanvasId.toString() === canvasIdStr)
						const hasMoreBlocks = canvas.blocks.length > 6

						return (
							<CarouselItem
								key={canvasIdStr || Math.random().toString()}
								className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
							>
								<div className={isActive ? 'p-0.5' : ''}>
									<Card
										className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
											isActive
												? 'border-2 border-brand ring-2 ring-brand/20 shadow-md bg-brand/5'
												: 'border border-gray-200 shadow-xs hover:shadow-md'
										}`}
										onClick={() => onSelectCanvas(canvas)}
										data-name={CANVAS_DATA_NAMES.CARD}
									>
										<CardContent className="p-4">
											<div className="space-y-3">
												<div className="flex items-center justify-between gap-2">
													<h4 className="font-medium text-gray-800 truncate flex-1">
														{canvas.name}
													</h4>
													<div className="flex items-center gap-1.5 shrink-0">
														<span className="text-xs text-gray-500">
															{canvas.blocks.length}{' '}
															{canvas.blocks.length === 1 ? 'block' : 'blocks'}
														</span>
														{!readOnly && onDeleteCanvas && (
															<Button
																type="button"
																size="icon"
																variant="ghost"
																className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
																data-name={CANVAS_DATA_NAMES.DELETE_BTN}
																onClick={e => {
																	e.stopPropagation()
																	onDeleteCanvas(canvasIdStr)
																}}
																title="Delete canvas"
															>
																<Trash2 className="h-3 w-3" />
															</Button>
														)}
													</div>
												</div>

												{/* Mini Canvas Block Preview */}
												<MiniCanvasPreview blocks={canvas.blocks} />

												{hasMoreBlocks && (
													<p className="text-xs text-muted-foreground text-center">
														+{canvas.blocks.length - 6} more
													</p>
												)}

												<div className="text-xs text-gray-400">
													{new Date(canvas.createdAt).toLocaleDateString()}
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							</CarouselItem>
						)
					})}
				</CarouselContent>

				{canvases.length > 3 && (
					<>
						<CarouselPrevious className="hidden sm:flex" />
						<CarouselNext className="hidden sm:flex" />
					</>
				)}
			</Carousel>
		</div>
	)
}
