'use client'

import { api } from '@/convex/_generated/api'
import { Preloaded, usePreloadedQuery } from 'convex/react'
import { notFound } from 'next/navigation'
import TargetScriptCard from './target-script-card'

export default function ReactiveTargetScriptsList({
	preloadedLearnerWithScripts,
}: {
	preloadedLearnerWithScripts: Preloaded<typeof api.learners.getByPassphrase>
}) {
	const learnerWithScripts = usePreloadedQuery(preloadedLearnerWithScripts)
	if (learnerWithScripts === null) {
		notFound()
	}

	return (
		<div className="flex flex-col md:flex-row gap-4 items-stretch">
			{learnerWithScripts.targetScripts.map(targetScript => (
				<div
					className="basis-full md:basis-1/3 grow"
					key={targetScript._id}
				>
					<TargetScriptCard targetScript={targetScript} />
				</div>
			))}
		</div>
	)
}
