'use client'

import { useEffect } from 'react'
import { useTimer } from '../_common/timer-context'
import { useRouter } from 'next/navigation'

export default function ElevenLabsWidget({
	agentId,
	baseUrl,
}: {
	agentId: string
	baseUrl: string
}) {
	const router = useRouter()
	const timer = useTimer()

	useEffect(() => {
		const onCall = (event: any) => {
			event.detail.config.clientTools = {
				startTimer: ({
					timerDurationSeconds,
				}: {
					timerDurationSeconds: number
				}) => {
					router.push(`${baseUrl}/timer`)
					timer.startTimer(timerDurationSeconds)
				},
			}
		}
		const onDOMContentLoaded = () => {
			const widget = document.querySelector('elevenlabs-convai')
			if (widget) {
				widget.addEventListener('elevenlabs-convai:call', onCall)
			}
		}

		// document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
		const widget = document.querySelector('elevenlabs-convai')
		if (widget) {
			widget.addEventListener('elevenlabs-convai:call', onCall)
		}

		return () => {
			document.removeEventListener('DOMContentLoaded', onDOMContentLoaded)
			const widget = document.querySelector('elevenlabs-convai')
			if (widget) {
				widget.removeEventListener('elevenlabs-convai:call', onCall)
			}
		}
	})

	return (
		<>
			{/* @ts-expect-error: because I said so */}
			<elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
		</>
	)
}
