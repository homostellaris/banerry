'use client'

import { CheckCircle2 } from 'lucide-react'
import { type QuizScript } from './select-quiz-scripts'

export default function ScriptOptionCard({
	script,
	isCrossedOut,
	isCorrect,
	isCorrectAnswer,
	isDisabled,
	onSelect,
}: {
	script: QuizScript
	isCrossedOut: boolean
	isCorrect: boolean
	isCorrectAnswer: boolean
	isDisabled: boolean
	onSelect: () => void
}) {
	return (
		<button
			data-name="quiz-option-card"
			data-quiz-correct={isCorrectAnswer ? 'true' : undefined}
			onClick={onSelect}
			disabled={isDisabled}
			className={[
				'relative w-full p-4 rounded-xl border-2 text-left transition-all',
				isCorrect
					? 'border-brand bg-brand/10 cursor-default'
					: isCrossedOut
						? 'border-gray-200 opacity-60 cursor-not-allowed'
						: 'border-brand/30 hover:border-brand hover:shadow-md cursor-pointer',
			].join(' ')}
		>
			<span
				className={[
					'text-base font-medium text-gray-800',
					isCrossedOut ? 'line-through' : '',
				].join(' ')}
			>
				{script.dialogue}
			</span>

			{isCorrect && (
				<>
					<CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-brand" />
					<span data-name="correct-script-id" className="sr-only">
						{script._id}
					</span>
				</>
			)}
		</button>
	)
}
