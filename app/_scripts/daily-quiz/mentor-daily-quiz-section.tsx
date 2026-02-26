'use client'

import { api } from '@/convex/_generated/api'
import { Preloaded, usePreloadedQuery, useQuery } from 'convex/react'
import { Button } from '@/components/ui/button'
import QuizModal from './quiz-modal'
import { useQuiz } from './use-quiz'
import { type QuizScript } from './select-quiz-scripts'

export default function MentorDailyQuizSection({
	preloadedLearnerWithScripts,
}: {
	preloadedLearnerWithScripts: Preloaded<typeof api.learners.getWithScripts>
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

	const passphrase = learnerWithScripts?.passphrase ?? ''

	const { quizState, openQuiz, closeQuiz, selectAnswer } = useQuiz(
		allScripts,
		passphrase,
		avatarUrl ?? null,
	)

	if (allScripts.length < 4) return null

	return (
		<>
			<Button
				onClick={openQuiz}
				size="lg"
				className="bg-brand hover:bg-brand/90 text-white font-semibold px-8"
			>
				Daily Quiz
			</Button>

			<QuizModal
				quizState={quizState}
				onClose={closeQuiz}
				onSelectAnswer={selectAnswer}
			/>
		</>
	)
}
