'use client'

import { useEffect, useState } from 'react'
import { useTimer } from '../_common/timer-context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function ElevenLabsWidget({
	agentId,
	baseUrl,
}: {
	agentId: string
	baseUrl: string
}) {
	const router = useRouter()
	const timer = useTimer()
	const [mobileVisible, setMobileVisible] = useState(false)

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

		const hide = () => {
			setMobileVisible(false)
			window.dispatchEvent(
				new CustomEvent('elevenlabs:mobile-visible', {
					detail: { visible: false },
				}),
			)
		}

		const onTrigger = () => {
			if (mobileVisible) {
				// Toggle off: try to end the active call then hide
				const widget = document.querySelector('elevenlabs-convai')
				if (widget) {
					const btn = (widget as any).shadowRoot?.querySelector('button')
					btn?.click()
				}
				hide()
				return
			}

			setMobileVisible(true)
			window.dispatchEvent(
				new CustomEvent('elevenlabs:mobile-visible', {
					detail: { visible: true },
				}),
			)
			// Click the widget's own button after React commits the visibility change
			setTimeout(() => {
				const widget = document.querySelector('elevenlabs-convai')
				if (!widget) return
				const btn = (widget as any).shadowRoot?.querySelector('button')
				if (btn) {
					btn.click()
				} else {
					;(widget as HTMLElement).click()
				}
			}, 50)
		}

		const widget = document.querySelector('elevenlabs-convai')
		if (widget) {
			widget.addEventListener('elevenlabs-convai:call', onCall)
			// Hide the widget when the call ends naturally (event name may vary by version)
			widget.addEventListener('elevenlabs-convai:call_ended', hide)
			widget.addEventListener('elevenlabs-convai:disconnect', hide)
		}
		window.addEventListener('elevenlabs:trigger', onTrigger)

		return () => {
			window.removeEventListener('elevenlabs:trigger', onTrigger)
			const widgetEl = document.querySelector('elevenlabs-convai')
			if (widgetEl) {
				widgetEl.removeEventListener('elevenlabs-convai:call', onCall)
				widgetEl.removeEventListener('elevenlabs-convai:call_ended', hide)
				widgetEl.removeEventListener('elevenlabs-convai:disconnect', hide)
			}
		}
	})

	return (
		// Invisible + no pointer events by default on all screen sizes; visibility:hidden
		// propagates into shadow DOM, suppressing the fixed-position floating button.
		// The nav mic button is the sole trigger on every viewport.
		<div className={cn(!mobileVisible && 'invisible pointer-events-none')}>
			{/* @ts-expect-error: because I said so */}
			<elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
		</div>
	)
}
