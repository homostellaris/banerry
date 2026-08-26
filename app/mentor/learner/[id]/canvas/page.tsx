'use client'

import { CanvasCarousel } from '@/app/_canvas/canvas-carousel'
import { CanvasEditor } from '@/app/_canvas/canvas-editor'
import { Canvas } from '@/app/_canvas/types'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function MentorCanvasPage() {
	const { id: selectedLearnerId } = useParams()
	const user = useQuery(api.auth.currentUser)

	const learner = useQuery(
		api.learners.get,
		selectedLearnerId
			? { learnerId: selectedLearnerId as Id<'learners'> }
			: 'skip',
	)

	const canvasesRaw = useQuery(
		api.canvases.getByPassphrase,
		learner?.passphrase
			? { passphrase: learner.passphrase }
			: 'skip',
	)

	const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null)

	if (user === null) {
		return (
			<div className="container mx-auto p-4 max-w-4xl">
				<div className="text-center">
					<p className="text-gray-500">Please sign in to access canvas.</p>
				</div>
			</div>
		)
	}

	const canvases: Canvas[] = (canvasesRaw as Canvas[]) || []
	const selectedCanvas = selectedCanvasId
		? canvases.find(c => String(c._id) === String(selectedCanvasId)) || (canvases.length > 0 ? canvases[0] : null)
		: canvases.length > 0
			? canvases[0]
			: null

	return (
		<div className="container mx-auto p-4 max-w-6xl space-y-6">
			<header className="text-center space-y-2">
				<h1 className="text-3xl sm:text-4xl font-bold text-brand">Canvas</h1>
				<p className="text-sm sm:text-base text-gray-600">
					A dedicated space for non-verbal expression, communication, and creativity
				</p>
			</header>

			{/* Informative message explaining learner ownership */}
			<div className="bg-brand/5 border-2 border-brand/20 rounded-2xl p-5 sm:p-6 text-center space-y-2 max-w-2xl mx-auto shadow-xs">
				<div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto text-xl">
					🎨
				</div>
				<h2 className="text-lg sm:text-xl font-bold text-gray-800">
					{learner ? `${learner.name}'s Creative Space` : 'Learner Self-Expression Space'}
				</h2>
				<p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
					This canvas area is owned exclusively by the learner for their personal creativity and self-expression. Canvases cannot be created or edited by mentors, but any canvases created by {learner?.name || 'the learner'} can be viewed here.
				</p>
			</div>

			{/* Top Carousel (Read-Only) */}
			{canvasesRaw !== undefined && (
				<CanvasCarousel
					canvases={canvases}
					activeCanvasId={selectedCanvas?._id}
					selectedCanvasId={selectedCanvasId}
					onSelectCanvas={canvas => setSelectedCanvasId(String(canvas._id))}
					onCreateNew={() => {}}
					readOnly={true}
				/>
			)}

			{/* Read-Only Canvas Editor View */}
			{selectedCanvas && (
				<CanvasEditor
					key={selectedCanvas._id?.toString()}
					canvas={selectedCanvas}
					passphrase=""
					isEditingMode={false}
					readOnly={true}
				/>
			)}
		</div>
	)
}
