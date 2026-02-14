'use client'

import { api } from '@/convex/_generated/api'
import { Preloaded, usePreloadedQuery } from 'convex/react'
import { notFound } from 'next/navigation'
import ScriptCard from './script-card'

export default function MentorScriptsList({
	preloadedLearnerWithScripts,
}: {
	preloadedLearnerWithScripts: Preloaded<typeof api.learners.getWithScripts>
}) {
	const learnerWithScripts = usePreloadedQuery(preloadedLearnerWithScripts)

	if (learnerWithScripts === null) {
		notFound()
	}

	return (
		<div className="grid gap-6">
			{learnerWithScripts.scripts.map(script => (
				<div
					key={script._id}
					className="block cursor-pointer"
				>
					<ScriptCard
						script={script}
						showDropdown
					/>
				</div>
			))}
		</div>
	)
}
