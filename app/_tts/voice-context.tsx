'use client'

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from 'react'

interface VoiceContextType {
	selectedVoice: string
	setSelectedVoice: (voice: string) => void
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined)

export function VoiceProvider({ children }: { children: ReactNode }) {
	const [selectedVoice, setSelectedVoiceState] = useState('nova')

	// Load saved voice preference on mount
	useEffect(() => {
		const savedVoice = localStorage.getItem('tts-voice')
		if (savedVoice) {
			setSelectedVoiceState(savedVoice)
		}
	}, [])

	const setSelectedVoice = (voice: string) => {
		setSelectedVoiceState(voice)
		localStorage.setItem('tts-voice', voice)
	}

	return (
		<VoiceContext.Provider value={{ selectedVoice, setSelectedVoice }}>
			{children}
		</VoiceContext.Provider>
	)
}

const DEFAULT_VOICE_CONTEXT: VoiceContextType = {
	selectedVoice: 'nova',
	setSelectedVoice: () => {},
}

export function useVoice(): VoiceContextType {
	const context = useContext(VoiceContext)
	return context || DEFAULT_VOICE_CONTEXT
}
