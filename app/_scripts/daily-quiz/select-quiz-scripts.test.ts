import { describe, expect, test } from 'bun:test'
import {
	selectQuizScripts,
	pruneHistory,
	type QuizScript,
	type QuizHistoryEntry,
} from './select-quiz-scripts'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function makeScript(
	id: string,
	overrides: Partial<QuizScript> = {},
): QuizScript {
	return {
		_id: id,
		dialogue: `Script ${id}`,
		parentheticals: '',
		_creationTime: Date.now() - THIRTY_DAYS_MS - 1,
		scriptType: 'script',
		...overrides,
	}
}

const fourScripts = [
	makeScript('1'),
	makeScript('2'),
	makeScript('3'),
	makeScript('4'),
]

describe('selectQuizScripts', () => {
	test('returns 4 options including the correct script', () => {
		const { correctScript, options } = selectQuizScripts(fourScripts, [])
		expect(options).toHaveLength(4)
		expect(options.some(o => o._id === correctScript._id)).toBe(true)
	})

	test('options contain no duplicates', () => {
		const scripts = [
			makeScript('1'),
			makeScript('2'),
			makeScript('3'),
			makeScript('4'),
			makeScript('5'),
			makeScript('6'),
		]
		const { options } = selectQuizScripts(scripts, [])
		const ids = options.map(o => o._id)
		expect(new Set(ids).size).toBe(4)
	})

	test('throws when fewer than 4 scripts provided', () => {
		expect(() => selectQuizScripts(fourScripts.slice(0, 3), [])).toThrow(
			'Need at least 4 scripts to run quiz',
		)
	})

	test('targetScripts are selected more often than regular scripts', () => {
		const targetScript = makeScript('target', { scriptType: 'targetScript' })
		const regularScripts = [
			makeScript('r1'),
			makeScript('r2'),
			makeScript('r3'),
		]
		const scripts = [...regularScripts, targetScript]

		let targetSelectedCount = 0
		const iterations = 500

		for (let i = 0; i < iterations; i++) {
			const { correctScript } = selectQuizScripts(scripts, [])
			if (correctScript._id === 'target') {
				targetSelectedCount++
			}
		}

		// With weight ×3, targetScript should be correct ~75% of the time (3/4 weight share)
		// Allow generous bounds for randomness
		expect(targetSelectedCount).toBeGreaterThan(iterations * 0.45)
	})

	test('recently added scripts are selected more often', () => {
		const recentScript = makeScript('recent', {
			_creationTime: Date.now() - 1000,
		})
		const oldScripts = [
			makeScript('o1', { _creationTime: Date.now() - THIRTY_DAYS_MS - 1 }),
			makeScript('o2', { _creationTime: Date.now() - THIRTY_DAYS_MS - 1 }),
			makeScript('o3', { _creationTime: Date.now() - THIRTY_DAYS_MS - 1 }),
		]
		const scripts = [...oldScripts, recentScript]

		let recentSelectedCount = 0
		const iterations = 500

		for (let i = 0; i < iterations; i++) {
			const { correctScript } = selectQuizScripts(scripts, [])
			if (correctScript._id === 'recent') {
				recentSelectedCount++
			}
		}

		// With weight ×2, recent script should be correct ~40% of the time (2/5 weight share)
		expect(recentSelectedCount).toBeGreaterThan(iterations * 0.25)
	})

	test('recently quizzed scripts are selected less often', () => {
		const quizzedScript = makeScript('quizzed')
		const otherScripts = [makeScript('o1'), makeScript('o2'), makeScript('o3')]
		const scripts = [quizzedScript, ...otherScripts]
		const history: QuizHistoryEntry[] = [
			{ scriptId: 'quizzed', timestamp: Date.now() - 1000 },
		]

		let quizzedSelectedCount = 0
		const iterations = 500

		for (let i = 0; i < iterations; i++) {
			const { correctScript } = selectQuizScripts(scripts, history)
			if (correctScript._id === 'quizzed') {
				quizzedSelectedCount++
			}
		}

		// With weight ×0.5, quizzed script should be correct ~14% of the time (0.5/3.5 weight share)
		expect(quizzedSelectedCount).toBeLessThan(iterations * 0.3)
	})
})

describe('pruneHistory', () => {
	test('keeps entries within 30 days', () => {
		const history: QuizHistoryEntry[] = [
			{ scriptId: '1', timestamp: Date.now() - 1000 },
			{ scriptId: '2', timestamp: Date.now() - THIRTY_DAYS_MS + 1000 },
		]
		expect(pruneHistory(history)).toHaveLength(2)
	})

	test('removes entries older than 30 days', () => {
		const history: QuizHistoryEntry[] = [
			{ scriptId: '1', timestamp: Date.now() - THIRTY_DAYS_MS - 1000 },
			{ scriptId: '2', timestamp: Date.now() - 1000 },
		]
		const result = pruneHistory(history)
		expect(result).toHaveLength(1)
		expect(result[0].scriptId).toBe('2')
	})

	test('returns empty array when all entries are old', () => {
		const history: QuizHistoryEntry[] = [
			{
				scriptId: '1',
				timestamp: Date.now() - THIRTY_DAYS_MS - 1000,
			},
		]
		expect(pruneHistory(history)).toHaveLength(0)
	})
})
