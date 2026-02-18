'use client'

import type React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

interface LearnerCardProps {
	learner: {
		_id: string
		name: string
		bio?: string
		avatarStorageId?: Id<'_storage'>
		_creationTime: number
	}
}

export default function LearnerCard({ learner }: LearnerCardProps) {
	const avatarUrl = useQuery(
		api.learners.getStorageUrl,
		learner.avatarStorageId ? { storageId: learner.avatarStorageId } : 'skip',
	)

	return (
		<Link
			href={`/mentor/learner/${learner._id}`}
			className="block"
			data-name="learner-card"
		>
			<Card className="overflow-hidden border-2 border-brand/20 shadow-md hover:shadow-lg transition-shadow h-full">
				<CardHeader className="pb-3">
					<div className="flex items-center gap-3">
						{avatarUrl ? (
							<img
								src={avatarUrl}
								alt={`${learner.name}'s avatar`}
								className="h-9 w-9 rounded-full object-cover"
							/>
						) : (
							<div className="rounded-full bg-brand/10 p-2">
								<User className="h-5 w-5 text-brand" />
							</div>
						)}
						<CardTitle className="text-xl font-bold text-gray-800">
							{learner.name}
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					{/* TODO: Change this to last activity */}
					<p className="text-xs text-gray-400">
						{/* Created {new Date(learner._creationTime).toLocaleDateString()} */}
					</p>
				</CardContent>
			</Card>
		</Link>
	)
}
