'use client'

import { Button } from '@/components/ui/button'
import { Volume2, Loader2 } from 'lucide-react'
import posthog from 'posthog-js'
import { useVoice } from '@/app/_tts/voice-context'
import { useCachedTTS } from '@/app/_tts/use-cached-tts'

interface AudioButtonProps {
	text: string
	'data-name'?: string
	className?: string
	iconClassName?: string
}

export default function AudioButton({ text, 'data-name': dataName, className, iconClassName }: AudioButtonProps) {
	let selectedVoice = 'alloy'
	try {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const voiceCtx = useVoice()
		if (voiceCtx?.selectedVoice) {
			selectedVoice = voiceCtx.selectedVoice
		}
	} catch {
		selectedVoice = 'alloy'
	}
	const { speak, isLoading, error } = useCachedTTS()

	const playAudio = (e: React.MouseEvent) => {
		e.preventDefault()
		posthog.capture('audio_played', {
			voice: selectedVoice,
		})
		speak(text, selectedVoice)
	}

	return (
		<div className="relative">
			<Button
				data-name={dataName}
				variant="ghost"
				size="icon"
				className={className || "rounded-full h-14 w-14 flex-shrink-0 bg-brand/10 hover:bg-brand/20"}
				onClick={playAudio}
				disabled={isLoading}
				aria-label="Play audio"
			>
				{isLoading ? (
					<Loader2 className={iconClassName || "h-8 w-8 text-brand animate-spin"} />
				) : (
					<Volume2 className={iconClassName || "h-8 w-8 text-brand"} />
				)}
			</Button>
			{error && (
				<div className="absolute mt-2 right-0 bg-red-50 border border-red-200 p-2 rounded text-sm text-red-600 max-w-xs">
					{error}
				</div>
			)}
		</div>
	)
}
