'use client'

import { useRouter } from 'next/navigation'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { api } from '@/convex/_generated/api'
import { Preloaded, usePreloadedQuery } from 'convex/react'
import { Id } from '@/convex/_generated/dataModel'

export default function LearnerPicker({
	preloadedLearners,
	selectedLearnerId,
}: {
	preloadedLearners: Preloaded<typeof api.learners.list>
	selectedLearnerId: Id<'learners'>
}) {
	const learners = usePreloadedQuery(preloadedLearners)
	const router = useRouter()
	console.log({ selectedLearnerId, learners })

	return (
		<Select
			onValueChange={learnerId => {
				router.push(`/mentor/learner/${learnerId}`)
			}}
			defaultValue={selectedLearnerId}
		>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Select a learner" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{learners.map(learner => (
						<SelectItem
							key={learner._id}
							value={learner._id}
						>
							{learner.name}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	)
}
