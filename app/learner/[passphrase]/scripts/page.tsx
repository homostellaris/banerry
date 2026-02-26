import QuickWords from '@/app/_common/quick-words'
import DailyQuizSection from '@/app/_scripts/daily-quiz/daily-quiz-section'
import ReactiveScriptsList from '@/app/_scripts/reactive-scripts-list'
import ReactiveTargetScriptsList from '@/app/_target-scripts/reactive-target-scripts-list'
import { api } from '@/convex/_generated/api'
import { preloadedQueryResult, preloadQuery } from 'convex/nextjs'

export default async function LearnerPage({
	params,
}: {
	params: Promise<{ passphrase: string }>
}) {
	const { passphrase } = await params
	const preloadedLearnerWithScripts = await preloadQuery(
		api.learners.getByPassphrase,
		{
			passphrase,
		},
	)

	const learnerWithScripts = preloadedQueryResult(preloadedLearnerWithScripts)

	return (
		<div className="container mx-auto p-4 max-w-4xl space-y-6">
			<QuickWords />

			<DailyQuizSection
				preloadedLearnerWithScripts={preloadedLearnerWithScripts}
				passphrase={passphrase}
			/>

			{learnerWithScripts?.targetScripts &&
				learnerWithScripts.targetScripts.length > 0 && (
					<ReactiveTargetScriptsList
						preloadedLearnerWithScripts={preloadedLearnerWithScripts}
					/>
				)}

			<ReactiveScriptsList
				preloadedLearnerWithScripts={preloadedLearnerWithScripts}
			/>
		</div>
	)
}
