import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test'
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

function mockFetch(
	impl: (url: string, options?: RequestInit) => Promise<Response>,
) {
	return Object.assign(mock(impl), {
		preconnect: mock(() => {}),
	}) as typeof fetch
}

describe('parseBoardPrompt', () => {
	const originalEnv = process.env.OPENAI_API_KEY
	const originalFetch = globalThis.fetch

	beforeEach(() => {
		process.env.OPENAI_API_KEY = 'test-api-key'
	})

	afterEach(() => {
		process.env.OPENAI_API_KEY = originalEnv
		globalThis.fetch = originalFetch
	})

	it('returns error when API key is missing', async () => {
		delete process.env.OPENAI_API_KEY

		const result = await parseBoardPrompt('wake up, brush teeth')

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe('OpenAI API key is not configured')
		}
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

	it('parses valid response from OpenAI', async () => {
		globalThis.fetch = mockFetch(() =>
			Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						choices: [
							{
								message: {
									content: JSON.stringify(validResponse),
								},
							},
						],
					}),
			} as Response),
		)

		const result = await parseBoardPrompt('wake up, brush teeth')

		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.boardName).toBe('Morning Routine')
			expect(result.data.columns).toHaveLength(2)
			expect(result.data.columns[0].title).toBe('Wake Up')
			expect(result.data.columns[1].title).toBe('Brush Teeth')
		}
	})

	it('handles API error response', async () => {
		globalThis.fetch = mockFetch(() =>
			Promise.resolve({
				ok: false,
				status: 429,
				json: () =>
					Promise.resolve({
						error: { message: 'Rate limit exceeded' },
					}),
			} as Response),
		)

		const result = await parseBoardPrompt('wake up, brush teeth')

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe('Rate limit exceeded')
		}
	})

	it('handles API error without message', async () => {
		globalThis.fetch = mockFetch(() =>
			Promise.resolve({
				ok: false,
				status: 500,
				json: () => Promise.reject(new Error('Invalid JSON')),
			} as Response),
		)

		const result = await parseBoardPrompt('wake up, brush teeth')

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe('OpenAI API error: 500')
		}
	})

	it('handles empty response from OpenAI', async () => {
		globalThis.fetch = mockFetch(() =>
			Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						choices: [{ message: { content: null } }],
					}),
			} as Response),
		)

		const result = await parseBoardPrompt('wake up, brush teeth')

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe('No response from GPT-4')
		}
	})

	it('handles invalid JSON structure - missing boardName', async () => {
		globalThis.fetch = mockFetch(() =>
			Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						choices: [
							{
								message: {
									content: JSON.stringify({
										columns: [{ title: 'Step', prompt: 'Do something' }],
									}),
								},
							},
						],
					}),
			} as Response),
		)

		const result = await parseBoardPrompt('wake up')

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe('Invalid response structure from GPT-4')
		}
	})

	it('handles invalid JSON structure - empty columns', async () => {
		globalThis.fetch = mockFetch(() =>
			Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						choices: [
							{
								message: {
									content: JSON.stringify({
										boardName: 'Test',
										columns: [],
									}),
								},
							},
						],
					}),
			} as Response),
		)

		const result = await parseBoardPrompt('wake up')

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe('Invalid response structure from GPT-4')
		}
	})

	it('handles invalid column structure - missing title', async () => {
		globalThis.fetch = mockFetch(() =>
			Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						choices: [
							{
								message: {
									content: JSON.stringify({
										boardName: 'Test',
										columns: [{ prompt: 'Do something' }],
									}),
								},
							},
						],
					}),
			} as Response),
		)

		const result = await parseBoardPrompt('wake up')

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe('Invalid column structure from GPT-4')
		}
	})

	it('handles invalid column structure - missing prompt', async () => {
		globalThis.fetch = mockFetch(() =>
			Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						choices: [
							{
								message: {
									content: JSON.stringify({
										boardName: 'Test',
										columns: [{ title: 'Step 1' }],
									}),
								},
							},
						],
					}),
			} as Response),
		)

		const result = await parseBoardPrompt('wake up')

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe('Invalid column structure from GPT-4')
		}
	})

	it('handles network error', async () => {
		globalThis.fetch = mockFetch(() =>
			Promise.reject(new Error('Network error')),
		)

		const result = await parseBoardPrompt('wake up, brush teeth')

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toBe('Network error')
		}
	})

	it('handles invalid JSON in response', async () => {
		globalThis.fetch = mockFetch(() =>
			Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						choices: [
							{
								message: {
									content: 'not valid json',
								},
							},
						],
					}),
			} as Response),
		)

		const result = await parseBoardPrompt('wake up')

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toContain('JSON')
		}
	})

	it('includes avatar description in request when provided', async () => {
		let capturedBody: string | undefined
		globalThis.fetch = mockFetch((_url: string, options?: RequestInit) => {
			capturedBody = options?.body as string
			return Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						choices: [
							{
								message: {
									content: JSON.stringify(validResponse),
								},
							},
						],
					}),
			} as Response)
		})

		await parseBoardPrompt('wake up', 'A girl with red hair and blue eyes')

		expect(capturedBody).toBeDefined()
		const parsed = JSON.parse(capturedBody!)
		expect(parsed.messages[1].content).toContain(
			'A girl with red hair and blue eyes',
		)
	})

	it('sends correct request structure to OpenAI', async () => {
		let capturedUrl: string | undefined
		let capturedOptions: RequestInit | undefined

		globalThis.fetch = mockFetch((url: string, options?: RequestInit) => {
			capturedUrl = url
			capturedOptions = options
			return Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						choices: [
							{
								message: {
									content: JSON.stringify(validResponse),
								},
							},
						],
					}),
			} as Response)
		})

		await parseBoardPrompt('wake up, brush teeth')

		expect(capturedUrl).toBe('https://api.openai.com/v1/chat/completions')
		expect(capturedOptions?.method).toBe('POST')
		expect(capturedOptions?.headers).toEqual({
			'Content-Type': 'application/json',
			Authorization: 'Bearer test-api-key',
		})

		const body = JSON.parse(capturedOptions?.body as string)
		expect(body.model).toBe('gpt-4o')
		expect(body.response_format).toEqual({ type: 'json_object' })
		expect(body.messages).toHaveLength(2)
		expect(body.messages[0].role).toBe('system')
		expect(body.messages[1].role).toBe('user')
		expect(body.messages[1].content).toContain('wake up, brush teeth')
	})
})
