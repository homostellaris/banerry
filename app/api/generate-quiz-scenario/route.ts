import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are a creative writer helping children learn to communicate. Write a short 2–3 sentence scenario in simple, friendly language suitable for a child. The scenario should describe a situation where someone would naturally say the given phrase. Do not include the phrase itself. Do not use quotation marks or dialogue. Write only the scenario, nothing else.`

export async function POST(request: Request) {
	const { dialogue } = (await request.json()) as { dialogue: string }

	try {
		const result = await generateText({
			model: gateway('google/gemini-2.5-flash'),
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{
					role: 'user',
					content: `Write a scenario where someone would say: "${dialogue}"`,
				},
			],
		})

		return Response.json({ success: true, scenarioText: result.text.trim() })
	} catch (error) {
		console.error('Error generating quiz scenario:', error)
		return Response.json({
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to generate scenario',
		})
	}
}
