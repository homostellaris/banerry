import AddScriptForm from '@/app/_scripts/add-script-form'
import MentorDailyQuizSection from '@/app/_scripts/daily-quiz/mentor-daily-quiz-section'
import MentorScriptsList from '@/app/_scripts/mentor-scripts-list'
import AddTargetScriptForm from '@/app/_target-scripts/add-target-script-form'
import MentorTargetScriptsList from '@/app/_target-scripts/mentor-target-scripts-list'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { preloadedQueryResult, preloadQuery } from 'convex/nextjs'
import { notFound } from 'next/navigation'

export default async function MentorLearnerPage({
	params,
}: {
	params: Promise<{ id: Id<'learners'> }>
}) {
	const { id } = await params

	const preloadedLearnerWithScripts = await preloadQuery(
		api.learners.getWithScripts,
		{
			learnerId: id,
		},
		{
			token: await convexAuthNextjsToken(),
		},
	)
	const learnerWithScripts = preloadedQueryResult(preloadedLearnerWithScripts)
	if (learnerWithScripts === null) notFound()

	return (
		<div className="container mx-auto p-4 max-w-4xl space-y-6">
			<div className="flex flex-wrap items-center gap-2">
				<AddScriptForm learnerId={id as Id<'learners'>} />
				<AddTargetScriptForm learnerId={id as Id<'learners'>} />
				<MentorDailyQuizSection
					preloadedLearnerWithScripts={preloadedLearnerWithScripts}
				/>
			</div>

			<div className="space-y-4">
				<h2 className="text-2xl font-bold text-brand-highlight flex items-center gap-2">
					🎯 Target Scripts
					<span className="text-sm font-normal text-gray-600">
						({learnerWithScripts.targetScripts.length}/3)
					</span>
				</h2>
				<MentorTargetScriptsList
					preloadedLearnerWithScripts={preloadedLearnerWithScripts}
				/>
			</div>

			<div className="space-y-4">
				<h2 className="text-2xl font-bold text-brand">📝 All Scripts</h2>
				<MentorScriptsList
					preloadedLearnerWithScripts={preloadedLearnerWithScripts}
				/>
			</div>
		</div>
	)
}
