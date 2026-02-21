'use server'

import fs from 'fs'
import path from 'path'
import { generateObject } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { z } from 'zod'

export interface Mitigation {
	id: string
	text: string
	explanation: string
}

const mitigationsSchema = z.object({
	mitigations: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
			explanation: z.string(),
		}),
	),
})

export async function generateMitigations(
	scriptText: string,
): Promise<Mitigation[]> {
	await new Promise(resolve => setTimeout(resolve, 500))

	try {
		const promptPath = path.join(
			process.cwd(),
			'app',
			'_mitigations',
			'prompt.md',
		)
		const promptTemplate = fs.readFileSync(promptPath, 'utf8')
		const prompt = promptTemplate.replace('{{SCRIPT}}', scriptText)

		console.log('Generating mitigations for script:', scriptText)

		const result = await generateObject({
			model: gateway('openai/gpt-4o'),
			schema: mitigationsSchema,
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.7,
		})

		console.log('Successfully generated mitigations')
		return result.object.mitigations
	} catch (error) {
		console.error('Error generating mitigations:', error)
		throw new Error(
			`Failed to generate mitigations: ${error instanceof Error ? error.message : String(error)}`,
		)
	}
}
