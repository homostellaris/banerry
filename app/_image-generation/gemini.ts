'use server'

import { stylePrompts } from './prompts'
import type { ImageStyle } from './image-generation'

interface GeminiImageResponse {
	candidates?: Array<{
		content?: {
			parts?: Array<{
				text?: string
				inlineData?: {
					mimeType: string
					data: string
				}
			}>
		}
	}>
	error?: {
		message: string
		code: number
	}
}

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

export async function generateImageWithGemini(
	prompt: string,
	style: ImageStyle,
	referenceImageUrl?: string,
): Promise<GenerateImageResult> {
	const apiKey = process.env.GOOGLE_AI_API_KEY
	if (!apiKey) {
		return {
			success: false,
			error:
				'Google AI API key is not configured. Please add GOOGLE_AI_API_KEY to your environment variables.',
		}
	}

	if (!prompt.trim()) {
		return {
			success: false,
			error: 'Prompt is required for image generation',
		}
	}

	const stylePromptTemplate = stylePrompts[style]
	const enhancedPrompt = stylePromptTemplate.replace('{{USER_PROMPT}}', prompt)

	console.log(
		`Generating image with Gemini for prompt: "${prompt}"${referenceImageUrl ? ' (with reference image)' : ''}`,
	)

	const parts: Array<{
		text?: string
		inline_data?: { mime_type: string; data: string }
	}> = []

	if (referenceImageUrl) {
		const referenceImageData = await fetchImageAsBase64(referenceImageUrl)
		parts.push({
			inline_data: {
				mime_type: 'image/png',
				data: referenceImageData,
			},
		})
	}

	parts.push({ text: enhancedPrompt })

	try {
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					contents: [
						{
							parts,
						},
					],
					generationConfig: {
						responseModalities: ['TEXT', 'IMAGE'],
					},
				}),
			},
		)

		if (!response.ok) {
			let errorMessage = `Gemini API error: ${response.status}`
			try {
				const errorData = await response.json()
				errorMessage = errorData.error?.message || errorMessage
			} catch {
				// If we can't parse the error response, use the status
			}

			console.error('Gemini API error:', errorMessage)

			if (response.status === 401 || response.status === 403) {
				return {
					success: false,
					error:
						'Invalid Google AI API key. Please check your GOOGLE_AI_API_KEY environment variable.',
				}
			}

			if (response.status === 429) {
				return {
					success: false,
					error: 'Google AI API rate limit exceeded. Please try again later.',
				}
			}

			return {
				success: false,
				error: errorMessage,
			}
		}

		const responseData: GeminiImageResponse = await response.json()

		const responseParts = responseData.candidates?.[0]?.content?.parts
		if (!responseParts || responseParts.length === 0) {
			return {
				success: false,
				error: 'No content in Gemini response',
			}
		}

		const imagePart = responseParts.find(part => part.inlineData)
		if (!imagePart?.inlineData) {
			return {
				success: false,
				error: 'No image data in Gemini response',
			}
		}

		console.log('Image generated successfully with Gemini')

		return {
			success: true,
			imageData: imagePart.inlineData.data,
			mimeType: imagePart.inlineData.mimeType,
		}
	} catch (error) {
		console.error('Gemini image generation error:', error)

		const errorMessage = error instanceof Error ? error.message : String(error)

		return {
			success: false,
			error: errorMessage,
		}
	}
}
