'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScenarioView from './scenario-view'
import ScriptOptionCard from './script-option-card'
import { type QuizState } from './select-quiz-scripts'

export default function QuizModal({
	quizState,
	onClose,
	onSelectAnswer,
}: {
	quizState: QuizState
	onClose: () => void
	onSelectAnswer: (scriptId: string) => void
}) {
	const isOpen = quizState.status !== 'idle'

	return (
		<DialogPrimitive.Root open={isOpen} onOpenChange={open => !open && onClose()}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
					<DialogPrimitive.Title className="sr-only">
						Daily Script Quiz
					</DialogPrimitive.Title>
					<DialogPrimitive.Description className="sr-only">
						Choose the script that best matches the scenario
					</DialogPrimitive.Description>

					<button
						onClick={onClose}
						className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
						aria-label="Close quiz"
					>
						<X className="h-6 w-6" />
					</button>

					<div className="flex flex-col items-center justify-center flex-1 gap-8 max-w-2xl mx-auto w-full">
						{quizState.status === 'loading' && (
							<div className="flex flex-col items-center gap-4">
								<Loader2 className="h-12 w-12 text-brand animate-spin" />
								<p className="text-gray-500">Getting your quiz ready...</p>
							</div>
						)}

						{quizState.status === 'error' && (
							<div className="flex flex-col items-center gap-4">
								<p className="text-red-600 text-center">{quizState.message}</p>
								<Button variant="outline" onClick={onClose}>
									Close
								</Button>
							</div>
						)}

						{(quizState.status === 'active' ||
							quizState.status === 'correct') && (
							<>
								<ScenarioView
									scenarioText={quizState.setup.scenarioText}
									scenarioImageBase64={quizState.setup.scenarioImageBase64}
								/>

								<div className="grid grid-cols-2 gap-4 w-full">
									{quizState.setup.options.map(script => {
										const isCrossedOut =
											quizState.status === 'active' &&
											quizState.answeredIds.includes(script._id)
										const isCorrectAnswer =
											script._id === quizState.setup.correctScript._id
										const isCorrect =
											quizState.status === 'correct' && isCorrectAnswer
										const isDisabled =
											quizState.status === 'correct' || isCrossedOut

										return (
											<ScriptOptionCard
												key={script._id}
												script={script}
												isCrossedOut={isCrossedOut}
												isCorrect={isCorrect}
												isCorrectAnswer={isCorrectAnswer}
												isDisabled={isDisabled}
												onSelect={() => onSelectAnswer(script._id)}
											/>
										)
									})}
								</div>

								{quizState.status === 'correct' && (
									<div className="flex flex-col items-center gap-4">
										<p className="text-2xl font-bold text-brand">Well done!</p>
										<Button onClick={onClose}>Close</Button>
									</div>
								)}
							</>
						)}
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}
