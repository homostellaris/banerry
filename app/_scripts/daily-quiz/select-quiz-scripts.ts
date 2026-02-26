export type QuizScript = {
	_id: string
	dialogue: string
	parentheticals: string
	_creationTime: number
	scriptType: 'script' | 'targetScript'
}

export type QuizHistoryEntry = { scriptId: string; timestamp: number }

export type QuizSetup = {
	correctScript: QuizScript
	options: QuizScript[]
	scenarioText: string
	scenarioImageBase64: string
}

export type QuizState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'error'; message: string }
	| { status: 'active'; setup: QuizSetup; answeredIds: string[] }
	| { status: 'correct'; setup: QuizSetup }

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

function computeWeight(
	script: QuizScript,
	history: QuizHistoryEntry[],
): number {
	const now = Date.now()
	let weight = 1

	if (script.scriptType === 'targetScript') {
		weight *= 3
	}

	if (now - script._creationTime < THIRTY_DAYS_MS) {
		weight *= 2
	}

	const recentlyQuizzed = history.some(
		entry =>
			entry.scriptId === script._id && now - entry.timestamp < THREE_DAYS_MS,
	)
	if (recentlyQuizzed) {
		weight *= 0.5
	}

	return weight
}

function weightedRandomPick<T>(
	items: T[],
	weights: number[],
): { picked: T; remainingItems: T[]; remainingWeights: number[] } {
	const totalWeight = weights.reduce((sum, w) => sum + w, 0)
	let random = Math.random() * totalWeight

	for (let i = 0; i < items.length; i++) {
		random -= weights[i]
		if (random <= 0) {
			return {
				picked: items[i],
				remainingItems: items.filter((_, index) => index !== i),
				remainingWeights: weights.filter((_, index) => index !== i),
			}
		}
	}

	const lastIndex = items.length - 1
	return {
		picked: items[lastIndex],
		remainingItems: items.slice(0, lastIndex),
		remainingWeights: weights.slice(0, lastIndex),
	}
}

function fisherYatesShuffle<T>(array: T[]): T[] {
	const shuffled = [...array]
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}
	return shuffled
}

export function selectQuizScripts(
	scripts: QuizScript[],
	history: QuizHistoryEntry[],
): { correctScript: QuizScript; options: QuizScript[] } {
	if (scripts.length < 4) {
		throw new Error('Need at least 4 scripts to run quiz')
	}

	const weights = scripts.map(script => computeWeight(script, history))

	const {
		picked: correctScript,
		remainingItems,
		remainingWeights,
	} = weightedRandomPick(scripts, weights)

	const distractors: QuizScript[] = []
	let availableItems = remainingItems
	let availableWeights = remainingWeights

	for (let i = 0; i < 3; i++) {
		const uniformWeights = availableItems.map(() => 1)
		const { picked, remainingItems: nextItems } = weightedRandomPick(
			availableItems,
			uniformWeights,
		)
		distractors.push(picked)
		availableItems = nextItems
		availableWeights = availableWeights.filter(
			(_, index) => availableItems[index] !== undefined,
		)
	}

	const options = fisherYatesShuffle([correctScript, ...distractors])

	return { correctScript, options }
}

export function pruneHistory(history: QuizHistoryEntry[]): QuizHistoryEntry[] {
	const cutoff = Date.now() - THIRTY_DAYS_MS
	return history.filter(entry => entry.timestamp > cutoff)
}
