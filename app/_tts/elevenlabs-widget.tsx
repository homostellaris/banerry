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
			window.dispatchEvent(new CustomEvent('elevenlabs:conversation-start'))
		}

		const onCallEnded = () => {
			setMobileVisible(false)
			window.dispatchEvent(new CustomEvent('elevenlabs:conversation-end'))
		}

		const onTrigger = () => {
			setMobileVisible(true)
			// Click the widget's button after React commits the visibility change
			setTimeout(() => {
				const widget = document.querySelector('elevenlabs-convai')
				if (!widget) return
				const shadowRoot = (widget as any).shadowRoot
				const btn = shadowRoot?.querySelector('button')
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
			widget.addEventListener('elevenlabs-convai:call_ended', onCallEnded)
		}
		window.addEventListener('elevenlabs:trigger', onTrigger)

		return () => {
			window.removeEventListener('elevenlabs:trigger', onTrigger)
			const widgetEl = document.querySelector('elevenlabs-convai')
			if (widgetEl) {
				widgetEl.removeEventListener('elevenlabs-convai:call', onCall)
				widgetEl.removeEventListener('elevenlabs-convai:call_ended', onCallEnded)
			}
		}
	})

	return (
		// On mobile: invisible + no pointer events by default (hides the floating button
		// without unmounting the web component, keeping its JS alive for event listeners).
		// visibility:hidden propagates into shadow DOM, suppressing fixed-position descendants.
		// On sm+ (desktop): normal rendering with native floating button.
		// When a mobile conversation is triggered, mobileVisible removes the hiding classes.
		<div
			className={cn(
				!mobileVisible && 'max-sm:invisible max-sm:pointer-events-none',
			)}
		>
			{/* @ts-expect-error: because I said so */}
			<elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
		</div>
	)
}
