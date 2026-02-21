'use server'

import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { stylePrompts } from './prompts'
import type { ImageStyle } from './image-generation'

export type GenerateImageResult =
	| {
			success: true
			imageData: string
			mimeType: string
	  }
	| {
			success: false
			error: string
	  }

async function fetchImageAsBase64(url: string): Promise<string> {
	const response = await fetch(url)
	const arrayBuffer = await response.arrayBuffer()
	return Buffer.from(arrayBuffer).toString('base64')
}

export async function generateImage(
	prompt: string,
	style: ImageStyle,
	referenceImageUrl?: string,
): Promise<GenerateImageResult> {
	if (!prompt.trim()) {
		return {
			success: false,
			error: 'Prompt is required for image generation',
		}
	}

	const stylePromptTemplate = stylePrompts[style]
	const enhancedPrompt = stylePromptTemplate.replace('{{USER_PROMPT}}', prompt)

	console.log(
		`Generating image for prompt: "${prompt}"${referenceImageUrl ? ' (with reference image)' : ''}`,
	)

	try {
		const userContent: Array<
			| { type: 'text'; text: string }
			| { type: 'image'; image: string; mimeType: string }
		> = []

		if (referenceImageUrl) {
			const referenceImageData = await fetchImageAsBase64(referenceImageUrl)
			userContent.push({
				type: 'image',
				image: referenceImageData,
				mimeType: 'image/png',
			})
		}

		userContent.push({ type: 'text', text: enhancedPrompt })

		const result = await generateText({
			model: gateway('google/gemini-2.5-flash-image'),
			messages: [{ role: 'user', content: userContent }],
			providerOptions: {
				google: { responseModalities: ['TEXT', 'IMAGE'] },
			},
		})

		const file = result.files[0]
		if (!file) {
			return {
				success: false,
				error: 'No image data in response',
			}
		}

		console.log('Image generated successfully')

		return {
			success: true,
			imageData: file.base64,
			mimeType: file.mediaType,
		}
	} catch (error) {
		console.error('Image generation error:', error)

		const errorMessage = error instanceof Error ? error.message : String(error)

		return {
			success: false,
			error: errorMessage,
		}
	}
}
