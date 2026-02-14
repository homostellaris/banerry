import Script from 'next/script'
import { PropsWithChildren } from 'react'
import ElevenLabsWidget from '../_tts/elevenlabs-widget'

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<>
			<Script
				src="https://unpkg.com/@elevenlabs/convai-widget-embed"
				async
				type="text/javascript"
			></Script>
			<ElevenLabsWidget
				agentId="agent_01k0qbvbr9fm0tmxc6a1szqs6k"
				baseUrl={'/mentor'}
			/>
			{children}
		</>
	)
}
