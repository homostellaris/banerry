import { http, HttpResponse } from 'msw'
import {
	TINY_PNG_BASE64,
	TINY_MP3_BASE64,
	CANNED_BOARD_PROMPT,
} from './fixtures'

export const handlers = [
	http.post('https://generativelanguage.googleapis.com/v1beta/models/*', () => {
		return HttpResponse.json({
			candidates: [
				{
					content: {
						parts: [
							{
								inlineData: {
									mimeType: 'image/png',
									data: TINY_PNG_BASE64,
								},
							},
						],
					},
				},
			],
		})
	}),

	http.post('https://api.openai.com/v1/chat/completions', () => {
		return HttpResponse.json({
			choices: [
				{
					message: {
						content: JSON.stringify(CANNED_BOARD_PROMPT),
					},
				},
			],
		})
	}),

	http.post('https://api.openai.com/v1/audio/speech', () => {
		const binaryData = Uint8Array.from(atob(TINY_MP3_BASE64), c =>
			c.charCodeAt(0),
		)
		return new HttpResponse(binaryData, {
			headers: { 'Content-Type': 'audio/mpeg' },
		})
	}),
]
