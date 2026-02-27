'use client'

import { useState } from 'react'
import { playCompletionSound } from '@/app/_common/play-completion-sound'
import {
	selectQuizScripts,
	pruneHistory,
	type QuizScript,
	type QuizState,
	type QuizHistoryEntry,
} from './select-quiz-scripts'

function getHistoryKey(passphrase: string) {
	return `banerry-quiz-history-${passphrase}`
}

function loadHistory(passphrase: string): QuizHistoryEntry[] {
	try {
		const raw = localStorage.getItem(getHistoryKey(passphrase))
		if (!raw) return []
		const parsed = JSON.parse(raw) as QuizHistoryEntry[]
		const pruned = pruneHistory(parsed)
		localStorage.setItem(getHistoryKey(passphrase), JSON.stringify(pruned))
		return pruned
	} catch {
		return []
	}
}

function saveHistoryEntry(passphrase: string, scriptId: string) {
	const history = loadHistory(passphrase)
	history.push({ scriptId, timestamp: Date.now() })
	localStorage.setItem(getHistoryKey(passphrase), JSON.stringify(history))
}

async function fetchScenario(
	dialogue: string,
	passphrase: string,
): Promise<{ scenarioText: string }> {
	const response = await fetch('/api/generate-quiz-scenario', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Learner-Passphrase': passphrase,
		},
		body: JSON.stringify({ dialogue }),
	})
	const result = (await response.json()) as
		| { success: true; scenarioText: string }
		| { success: false; error: string }
	if (!result.success) {
		throw new Error(result.error)
	}
	return { scenarioText: result.scenarioText }
}

async function fetchScenarioImage(
	dialogue: string,
	avatarUrl: string | null,
	passphrase: string,
): Promise<string> {
	const basePrompt = `A friendly scene for children showing someone about to say "${dialogue}". Simple, cheerful illustration. Do not add any text, words, or labels to the image.`
	const prompt = avatarUrl
		? `Using the character from the reference image as the main character, generate an image of them: ${basePrompt} The character must match the reference image exactly - same appearance, clothing, and style.`
		: basePrompt
	const response = await fetch('/api/generate-image', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Learner-Passphrase': passphrase,
		},
		body: JSON.stringify({
			prompt,
			style: 'studio-ghibli',
			referenceImageUrl: avatarUrl ?? undefined,
		}),
	})
	const result = (await response.json()) as
		| { success: true; imageData: string }
		| { success: false; error: string }
	if (!result.success) {
		throw new Error(result.error)
	}
	return result.imageData
}

export function useQuiz(
	allScripts: QuizScript[],
	passphrase: string,
	avatarUrl: string | null,
): {
	quizState: QuizState
	openQuiz: () => void
	closeQuiz: () => void
	selectAnswer: (scriptId: string) => void
} {
	const [quizState, setQuizState] = useState<QuizState>({ status: 'idle' })

	async function openQuiz() {
		setQuizState({ status: 'loading' })

		try {
			const history = loadHistory(passphrase)
			const { correctScript, options } = selectQuizScripts(allScripts, history)

			const [{ scenarioText }, scenarioImageBase64] = await Promise.all([
				fetchScenario(correctScript.dialogue, passphrase),
				fetchScenarioImage(correctScript.dialogue, avatarUrl, passphrase),
			])

			setQuizState({
				status: 'active',
				setup: {
					correctScript,
					options,
					scenarioText,
					scenarioImageBase64,
				},
				answeredIds: [],
			})
		} catch (error) {
			setQuizState({
				status: 'error',
				message:
					error instanceof Error ? error.message : 'Something went wrong',
			})
		}
	}

	function closeQuiz() {
		setQuizState({ status: 'idle' })
	}

	async function selectAnswer(scriptId: string) {
		if (quizState.status !== 'active') return

		const { setup, answeredIds } = quizState

		if (scriptId === setup.correctScript._id) {
			saveHistoryEntry(passphrase, scriptId)

			const confetti = (await import('canvas-confetti')).default
			confetti({
				particleCount: 120,
				spread: 80,
				origin: { y: 0.6 },
			})

			playCompletionSound().catch(() => {})

			setQuizState({ status: 'correct', setup })
		} else {
			setQuizState({
				status: 'active',
				setup,
				answeredIds: [...answeredIds, scriptId],
			})
		}
	}

	return { quizState, openQuiz, closeQuiz, selectAnswer }
}
