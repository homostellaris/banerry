'use client'

import { ActivityRequestOverlay } from '@/app/_boards/activity-request-overlay'
import AudioButton from '@/app/_tts/audio-button'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { ImageIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { MentorActivityCardDisplay } from './mentor-activity-card-display'

export { MentorActivityCardDisplay } from './mentor-activity-card-display'

interface Activity {
	id: string
	boardId: Id<'boards'>
	columnId: string
	title: string
	imageStorageId: Id<'_storage'>
	imagePrompt?: string
	boardName: string
}

export default function MentorActivitiesPage() {
	const { id: learnerId } = useParams()
	const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

	const boards = useQuery(
		api.boards.getBoards,
		learnerId ? { learnerId: learnerId as Id<'learners'> } : 'skip',
	)

	const activities: Activity[] = boards
		? boards.flatMap(board =>
				board.columns
					.filter(col => col.imageStorageId)
					.map(col => ({
						id: `${board._id}-${col.id}`,
						boardId: board._id,
						columnId: col.id,
						title: col.title,
						imageStorageId: col.imageStorageId as Id<'_storage'>,
						imagePrompt: col.imagePrompt,
						boardName: board.name,
					})),
			)
		: []

	if (!boards) {
		return (
			<div className="container mx-auto p-4 max-w-4xl">
				<p className="text-center text-gray-500">Loading...</p>
			</div>
		)
	}

	if (activities.length === 0) {
		return (
			<div className="container mx-auto p-4 max-w-4xl">
				<div className="flex flex-col items-center gap-4 py-16 text-center text-gray-400">
					<ImageIcon className="h-16 w-16" />
					<p className="text-lg font-medium">No activities yet</p>
					<p className="text-sm">
						Activities appear here once boards have generated images.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-4 max-w-6xl">
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				{activities.map(activity => (
					<MentorActivityCard
						key={activity.id}
						activity={activity}
						onSelect={setSelectedActivity}
					/>
				))}
			</div>

			{selectedActivity && (
				<ActivityRequestOverlay
					imageStorageId={selectedActivity.imageStorageId}
					title={selectedActivity.title}
					onClose={() => setSelectedActivity(null)}
				/>
			)}
		</div>
	)
}

function MentorActivityCard({
	activity,
	onSelect,
}: {
	activity: Activity
	onSelect: (a: Activity) => void
}) {
	const imageUrl = useQuery(api.boards.getImageUrl, {
		storageId: activity.imageStorageId,
	})

	const updateColumnTitle = useMutation(api.boards.updateColumnTitle)
	const updateColumnImage = useMutation(api.boards.updateColumnImage)
	const generateUploadUrl = useMutation(api.boards.generateUploadUrl)

	const handleSaveTitle = async (newTitle: string) => {
		await updateColumnTitle({
			boardId: activity.boardId,
			columnId: activity.columnId,
			title: newTitle,
		})
	}

	const handleGenerateImage = async (prompt: string) => {
		const result = await fetch('/api/generate-image', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ prompt, size: '1024x1024', style: 'studio-ghibli' }),
		}).then(r => r.json())

		if (!result.success) throw new Error(result.error || 'Failed to generate image')

		const base64Response = await fetch(`data:image/png;base64,${result.imageData}`)
		const blob = await base64Response.blob()
		const uploadUrl = await generateUploadUrl()
		const uploadResponse = await fetch(uploadUrl, {
			method: 'POST',
			headers: { 'Content-Type': blob.type },
			body: blob,
		})
		const { storageId } = await uploadResponse.json()

		await updateColumnImage({
			boardId: activity.boardId,
			columnId: activity.columnId,
			imageStorageId: storageId,
			imagePrompt: prompt,
		})
	}

	return (
		<MentorActivityCardDisplay
			title={activity.title}
			imageUrl={imageUrl ?? null}
			defaultPrompt={activity.imagePrompt ?? ''}
			audioButton={<AudioButton text={activity.title} />}
			onSelect={() => onSelect(activity)}
			onSaveTitle={handleSaveTitle}
			onGenerateImage={handleGenerateImage}
		/>
	)
}
