'use server'

export async function generateSpeech(text: string, voice = 'nova') {
	try {
		// Check if API key is available
		const apiKey = process.env.OPENAI_API_KEY
		if (!apiKey) {
			return {
				success: false,
				error:
					'OpenAI API key is not configured. Please add your OPENAI_API_KEY to the environment variables.',
			}
		}

		// Validate inputs
		if (!text) {
			return {
				success: false,
				error: 'Text is required for speech generation',
			}
		}

		// Validate voice parameter
		const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
		if (!validVoices.includes(voice)) {
			return {
				success: false,
				error: `Voice must be one of: ${validVoices.join(', ')}`,
			}
		}

		console.log(`Generating speech for text: "${text}" with voice: ${voice}`)

		// Use direct fetch to OpenAI API
		const response = await fetch('https://api.openai.com/v1/audio/speech', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: 'tts-1',
				voice: voice,
				input: text,
			}),
		})

		if (!response.ok) {
			let errorMessage = `OpenAI API error: ${response.status}`
			try {
				const errorData = await response.json()
				errorMessage = errorData.error?.message || errorMessage
			} catch {
				// If we can't parse the error response, use the status
			}

			console.error('OpenAI API error:', errorMessage)

			if (response.status === 401) {
				return {
					success: false,
					error:
						'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.',
				}
			}

			if (response.status === 429) {
				return {
					success: false,
					error: 'OpenAI API rate limit exceeded. Please try again later.',
				}
			}

			return {
				success: false,
				error: errorMessage,
			}
		}

		// Get the audio data as array buffer
		const audioData = await response.arrayBuffer()

		console.log('Speech generated successfully')

		// Convert to base64 for transmission
		const base64Audio = Buffer.from(audioData).toString('base64')

		return {
			success: true,
			audioData: base64Audio,
			contentType: 'audio/mpeg',
			text: text,
		}
	} catch (error) {
		console.error('TTS error:', error)

		const errorMessage = error instanceof Error ? error.message : String(error)

		return {
			success: false,
			error: errorMessage,
		}
	}
}
