'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'

export default function ElevenLabsNavButton() {
	const [isActive, setIsActive] = useState(false)

	useEffect(() => {
		const onStart = () => setIsActive(true)
		const onEnd = () => setIsActive(false)
		window.addEventListener('elevenlabs:conversation-start', onStart)
		window.addEventListener('elevenlabs:conversation-end', onEnd)
		return () => {
			window.removeEventListener('elevenlabs:conversation-start', onStart)
			window.removeEventListener('elevenlabs:conversation-end', onEnd)
		}
	}, [])

	return (
		<Button
			variant="ghost"
			size="icon"
			className="sm:hidden flex-shrink-0"
			aria-label={isActive ? 'Assistant is listening' : 'Talk to assistant'}
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
