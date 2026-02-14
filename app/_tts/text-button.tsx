'use client'

import { useVoice } from '@/app/_tts/voice-context'
import { useCachedTTS } from '@/app/_tts/use-cached-tts'

interface TextButtonProps {
	text: string
	className?: string
}

export default function TextButton({ text, className = '' }: TextButtonProps) {
	const { selectedVoice } = useVoice()
	const { speak, isLoading, error } = useCachedTTS()

	const playAudio = (e: React.MouseEvent) => {
		e.preventDefault()
		speak(text, selectedVoice)
	}

	return (
		<div className="relative">
			<button
				className={`transition-colors ${isLoading ? 'opacity-75 cursor-wait' : 'hover:opacity-80'} ${className}`}
				onClick={playAudio}
				disabled={isLoading}
				aria-label={`Speak: ${text}`}
			>
				{text}
			</button>
			{error && (
				<div className="absolute mt-2 right-0 bg-red-50 border border-red-200 p-2 rounded text-sm text-red-600 max-w-xs z-10">
					{error}
				</div>
			)}
		</div>
	)
}
