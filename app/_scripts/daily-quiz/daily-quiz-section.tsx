'use client'

import { api } from '@/convex/_generated/api'
import { Preloaded, usePreloadedQuery, useQuery } from 'convex/react'
import { Button } from '@/components/ui/button'
import QuizModal from './quiz-modal'
import { useQuiz } from './use-quiz'
import { type QuizScript } from './select-quiz-scripts'

export default function DailyQuizSection({
	preloadedLearnerWithScripts,
	passphrase,
}: {
	preloadedLearnerWithScripts: Preloaded<typeof api.learners.getByPassphrase>
	passphrase: string
}) {
	const learnerWithScripts = usePreloadedQuery(preloadedLearnerWithScripts)

	const avatarUrl = useQuery(
		api.learners.getStorageUrl,
		learnerWithScripts?.avatarStorageId
			? { storageId: learnerWithScripts.avatarStorageId }
			: 'skip',
	)

	const allScripts: QuizScript[] = [
		...(learnerWithScripts?.scripts ?? []).map(s => ({
			...s,
			scriptType: 'script' as const,
		})),
		...(learnerWithScripts?.targetScripts ?? []).map(s => ({
			...s,
			scriptType: 'targetScript' as const,
		})),
	]

	const { quizState, openQuiz, closeQuiz, selectAnswer } = useQuiz(
		allScripts,
		passphrase,
		avatarUrl ?? null,
	)

	if (allScripts.length < 4) return null

	return (
		<>
			<div className="flex justify-center">
				<Button
					onClick={openQuiz}
					size="lg"
					className="bg-brand hover:bg-brand/90 text-white font-semibold px-8"
				>
					Daily Quiz
				</Button>
			</div>

			<QuizModal
				quizState={quizState}
				onClose={closeQuiz}
				onSelectAnswer={selectAnswer}
			/>
		</>
	)
}
