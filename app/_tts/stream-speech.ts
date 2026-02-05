'use server'

import type { StreamTextToSpeechRequest } from '@elevenlabs/elevenlabs-js/api'
import { PassThrough } from 'stream'

import { Err, Ok, Result } from '@/types'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

export async function streamSpeech(
	voiceId: string,
	request: StreamTextToSpeechRequest,
): Promise<Result<ReadableStream<Uint8Array>>> {
	const client = new ElevenLabsClient()

	try {
		const nodeStream = await client.textToSpeech.stream(voiceId, request)

		const passThrough = new PassThrough()

		try {
			const reader = nodeStream.getReader()
			while (true) {
				const { value, done } = await reader.read()
				if (done) break
				const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value)
				passThrough.write(buffer)
			}
			passThrough.end()
		} catch (err) {
			passThrough.destroy(err instanceof Error ? err : new Error(String(err)))
		}

		// TODO: fix this, it's a hack to get around the fact that the SDK response is not a web stream
		const webStream = new ReadableStream<Uint8Array>({
			start(controller) {
				passThrough.on('data', (chunk: Buffer) => {
					controller.enqueue(new Uint8Array(chunk))
				})
				passThrough.on('end', () => {
					controller.close()
				})
				passThrough.on('error', err => {
					controller.error(err)
				})
			},
			cancel() {
				passThrough.destroy()
			},
		})

		return Ok(webStream)
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		return Err(`Failed to stream text to speech error: ${errorMessage}`)
	}
}
