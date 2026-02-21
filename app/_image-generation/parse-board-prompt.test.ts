import { it, expect, mock, beforeEach } from 'bun:test'

const generateObject = mock()

mock.module('ai', () => ({
	generateObject,
}))

mock.module('@ai-sdk/gateway', () => ({
	gateway: (modelId: string) => modelId,
}))

import { parseBoardPrompt } from './parse-board-prompt'

const validResponse = {
	boardName: 'Morning Routine',
	characterDescription: 'A 7-year-old boy with brown hair',
	styleConsistency: 'Medium shot, eye-level camera angle',
	columns: [
		{ title: 'Wake Up', prompt: 'A 7-year-old boy waking up in bed' },
		{ title: 'Brush Teeth', prompt: 'A 7-year-old boy brushing teeth' },
	],
}

beforeEach(() => {
	generateObject.mockReset()
})

it('returns error when prompt is empty', async () => {
	const result = await parseBoardPrompt('')

	expect(result.success).toBe(false)
	if (!result.success) {
		expect(result.error).toBe('Please enter a routine description')
	}
})

it('returns error when prompt is only whitespace', async () => {
	const result = await parseBoardPrompt('   ')

	expect(result.success).toBe(false)
	if (!result.success) {
		expect(result.error).toBe('Please enter a routine description')
	}
})

it('parses valid response', async () => {
	generateObject.mockResolvedValue({ object: validResponse })

	const result = await parseBoardPrompt('wake up, brush teeth')

	expect(result.success).toBe(true)
	if (result.success) {
		expect(result.data.boardName).toBe('Morning Routine')
		expect(result.data.columns).toHaveLength(2)
		expect(result.data.columns[0].title).toBe('Wake Up')
		expect(result.data.columns[1].title).toBe('Brush Teeth')
	}
})

it('includes avatar description in prompt when provided', async () => {
	generateObject.mockResolvedValue({ object: validResponse })

	await parseBoardPrompt('wake up', 'A girl with red hair and blue eyes')

	const call = generateObject.mock.calls[0][0]
	expect(call.messages[1].content).toContain(
		'A girl with red hair and blue eyes',
	)
})

it('propagates errors from generateObject', async () => {
	generateObject.mockRejectedValue(new Error('API rate limit exceeded'))

	const result = await parseBoardPrompt('wake up, brush teeth')

	expect(result.success).toBe(false)
	if (!result.success) {
		expect(result.error).toBe('API rate limit exceeded')
	}
})
