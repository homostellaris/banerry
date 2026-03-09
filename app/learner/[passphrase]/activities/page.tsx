'use client'

import { ActivityRequestOverlay } from '@/app/_boards/activity-request-overlay'
import AudioButton from '@/app/_tts/audio-button'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { ImageIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Activity {
	id: string
	title: string
	imageStorageId: Id<'_storage'>
	boardName: string
}

export default function ActivitiesPage({
	params,
}: {
	params: Promise<{ passphrase: string }>
}) {
	const [passphrase, setPassphrase] = useState<string>('')
	const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

	useEffect(() => {
		params.then(p => setPassphrase(p.passphrase))
	}, [params])

	const learner = useQuery(
		api.learners.getLearnerByPassphrase,
		passphrase ? { passphrase } : 'skip',
	)

	const boards = useQuery(
		api.boards.getBoards,
		learner?._id ? { learnerId: learner._id } : 'skip',
	)

	const activities: Activity[] = boards
		? boards.flatMap(board =>
				board.columns
					.filter(col => col.imageStorageId)
					.map(col => ({
						id: `${board._id}-${col.id}`,
						title: col.title,
						imageStorageId: col.imageStorageId as Id<'_storage'>,
						boardName: board.name,
					})),
			)
		: []

	if (!learner) {
		return (
			<div className="container mx-auto p-4 max-w-4xl">
				<p className="text-center text-gray-500">Loading...</p>
			</div>
		)
	}

	if (boards && activities.length === 0) {
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
					<ActivityCard
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

function ActivityCard({
	activity,
	onSelect,
}: {
	activity: Activity
	onSelect: (a: Activity) => void
}) {
	const imageUrl = useQuery(api.boards.getImageUrl, {
		storageId: activity.imageStorageId,
	})

	return (
		<div className="flex flex-col rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
			<button
				className="aspect-square w-full cursor-pointer hover:opacity-90 transition-opacity"
				onClick={() => onSelect(activity)}
				aria-label={activity.title}
			>
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={activity.title}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full bg-gray-100 flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
					</div>
				)}
			</button>
			<div className="flex items-center gap-3 px-3 py-3 bg-white">
				<p className="flex-1 text-sm font-medium truncate">{activity.title}</p>
				<AudioButton text={activity.title} />
			</div>
		</div>
	)
}
