'use client'

import { useLayoutEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'

export default function ElevenLabsNavButton() {
	const [isActive, setIsActive] = useState(false)

	// useLayoutEffect ensures the listener is registered synchronously after
	// the DOM mutation, before any external code (including Cypress) can
	// dispatch events. useEffect fires asynchronously and can race in CI.
	useLayoutEffect(() => {
		const onVisibilityChange = (event: Event) => {
			setIsActive((event as CustomEvent<{ visible: boolean }>).detail.visible)
		}
		window.addEventListener('elevenlabs:mobile-visible', onVisibilityChange)
		return () => {
			window.removeEventListener(
				'elevenlabs:mobile-visible',
				onVisibilityChange,
			)
		}
	}, [])

	return (
		<Button
			variant="ghost"
			size="icon"
			className="flex-shrink-0"
			aria-label={isActive ? 'Dismiss assistant' : 'Talk to assistant'}
			onClick={() => window.dispatchEvent(new CustomEvent('elevenlabs:trigger'))}
		>
			{isActive ? (
				<MicOff className="h-4 w-4" />
			) : (
				<Mic className="h-4 w-4" />
			)}
		</Button>
	)
}
