'use client'

import { usePreloadedQuery, useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'
import {
	CanvasEmptyState,
	CanvasCarousel,
	CanvasEditor,
} from '@/components/canvas'
import type { Canvas, CanvasBlock } from '@/lib/types/canvas'
import { Id } from '@/convex/_generated/dataModel'
import { Preloaded } from 'convex/react'

export default function CanvasPageClient({
	passphrase,
	preloadedLearner,
}: {
	passphrase: string
	preloadedLearner: Preloaded<typeof api.learners.getByPassphrase>
}) {
	const learner = usePreloadedQuery(preloadedLearner)

	const convexCanvases = useQuery(
		api.canvas.getCanvases,
		learner?._id ? { learnerId: learner._id } : 'skip',
	)

	const [selectedCanvasId, setSelectedCanvasId] = useState<string | undefined>(
		undefined,
	)
	const [isCreating, setIsCreating] = useState(false)

	const createCanvasMutation = useMutation(api.canvas.createCanvas)
	const updateCanvasMutation = useMutation(api.canvas.updateCanvas)
	const deleteCanvasMutation = useMutation(api.canvas.deleteCanvas)

	if (!learner) {
		return (
			<div className="container mx-auto p-4 max-w-4xl text-center text-gray-500 py-12">
				Learner not found.
			</div>
		)
	}

	const canvases: Canvas[] = (convexCanvases || []).map(c => ({
		id: c._id,
		title: c.title,
		learnerId: c.learnerId,
		blocks: c.blocks as CanvasBlock[],
		createdAt: c.createdAt,
		updatedAt: c.updatedAt,
	}))

	const selectedCanvas = canvases.find(c => c.id === selectedCanvasId) || null

	const handleCreateNew = () => {
		setSelectedCanvasId(undefined)
		setIsCreating(true)
	}

	const handleSelectCanvas = (canvas: Canvas) => {
		setIsCreating(false)
		setSelectedCanvasId(canvas.id)
	}

	const handleSaveCanvas = async (data: {
		title: string
		blocks: CanvasBlock[]
	}) => {
		if (!learner?._id) return

		if (selectedCanvasId && !isCreating) {
			await updateCanvasMutation({
				canvasId: selectedCanvasId as Id<'canvases'>,
				title: data.title,
				blocks: data.blocks,
			})
		} else {
			const newId = await createCanvasMutation({
				learnerId: learner._id,
				title: data.title,
				blocks: data.blocks,
			})
			setSelectedCanvasId(newId)
			setIsCreating(false)
		}
	}

	const handleDeleteCanvas = async (canvasId: string) => {
		await deleteCanvasMutation({
			canvasId: canvasId as Id<'canvases'>,
		})
		setSelectedCanvasId(undefined)
		setIsCreating(false)
	}

	const showEmptyState = canvases.length === 0 && !isCreating

	return (
		<div className="container mx-auto p-4 max-w-4xl space-y-6">
			<header className="text-center mb-6">
				<h1 className="text-4xl font-bold text-purple-700 mb-2">
					Learner Canvas
				</h1>
				<p className="text-gray-600">
					A creative space to express yourself with sounds, scripts, activities,
					numbers, letters & colors.
				</p>
			</header>

			{canvases.length > 0 && (
				<div className="flex flex-col gap-4">
					<div className="flex justify-between items-center">
						<h2 className="text-lg font-bold text-gray-800">Your Canvases</h2>
						{!isCreating && (
							<button
								data-name="create-canvas-button"
								onClick={handleCreateNew}
								className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition"
							>
								+ New Canvas
							</button>
						)}
					</div>
					<CanvasCarousel
						canvases={canvases}
						selectedCanvasId={selectedCanvasId}
						onSelectCanvas={handleSelectCanvas}
					/>
				</div>
			)}

			{showEmptyState ? (
				<CanvasEmptyState onCreateCanvas={handleCreateNew} />
			) : (
				<CanvasEditor
					key={selectedCanvasId || 'new-canvas'}
					canvas={selectedCanvas}
					onSave={handleSaveCanvas}
					onDelete={selectedCanvasId ? handleDeleteCanvas : undefined}
				/>
			)}
		</div>
	)
}
