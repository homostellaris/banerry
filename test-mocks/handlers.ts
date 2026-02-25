import { http, HttpResponse } from 'msw'
import { TINY_PNG_BASE64, CANNED_BOARD_PROMPT } from './fixtures'

export const handlers = [
	http.post(
		'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash*',
		() => {
			return HttpResponse.json({
				candidates: [
					{
						content: {
							parts: [{ text: JSON.stringify(CANNED_BOARD_PROMPT) }],
							role: 'model',
						},
						finishReason: 'STOP',
					},
				],
			})
		},
	),

	http.post(
		'https://generativelanguage.googleapis.com/v1beta/models/*image*',
		() => {
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
		},
	),
]
