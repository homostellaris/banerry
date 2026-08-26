'use client'

import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { ActivityPickerProps, ActivityItem, CANVAS_DATA_NAMES } from './types'

const FALLBACK_ACTIVITIES: ActivityItem[] = [
	{ id: 'fallback-act-1', title: 'Brush Teeth' },
	{ id: 'fallback-act-2', title: 'Morning Routine' },
	{ id: 'fallback-act-3', title: 'Story Time' },
]

function ActivityPickerThumbnail({
	imageStorageId,
	imageUrl,
	title,
}: {
	imageStorageId?: Id<'_storage'> | string
	imageUrl?: string
	title: string
}) {
	let storageUrl: string | null | undefined = null
	try {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		storageUrl = useQuery(
			api.boards.getImageUrl,
			imageStorageId ? { storageId: imageStorageId as Id<'_storage'> } : 'skip',
		)
	} catch {
		storageUrl = null
	}

	const src = imageUrl || storageUrl

	if (src) {
		return (
			<img
				src={src}
				alt={title}
				className="w-12 h-12 object-cover rounded-lg shrink-0 border border-gray-200"
			/>
		)
	}

	return (
		<div className="w-12 h-12 rounded-lg shrink-0 bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center border border-emerald-200 text-emerald-800 font-bold text-lg select-none">
			🎯
		</div>
	)
}

export function ActivityPickerModal({
	isOpen,
	activities = [],
	selectedActivityId,
	onSelectActivity,
	onClose,
}: ActivityPickerProps) {
	if (!isOpen) return null

	const displayActivities =
		activities.length > 0 ? activities : FALLBACK_ACTIVITIES

	return (
		<div
			data-name={CANVAS_DATA_NAMES.ACTIVITY_PICKER_MODAL}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
				onClick={e => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
					<h3 className="text-lg font-bold text-gray-800">Select Activity</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 font-bold px-2 text-xl rounded-md"
					>
						×
					</button>
				</div>
				<div className="p-4 overflow-y-auto space-y-2 flex-1">
					{displayActivities.map(activity => (
						<div
							key={activity.id}
							data-name={CANVAS_DATA_NAMES.ACTIVITY_ITEM_OPTION}
							onClick={() => {
								onSelectActivity(activity)
								onClose()
							}}
							className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
								selectedActivityId === activity.id
									? 'border-emerald-500 bg-emerald-50'
									: 'border-gray-200 hover:bg-gray-50'
							}`}
						>
							<ActivityPickerThumbnail
								imageStorageId={activity.imageStorageId}
								imageUrl={activity.imageUrl}
								title={activity.title}
							/>
							<div className="text-sm font-medium text-gray-800 flex-1">
								{activity.title}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

