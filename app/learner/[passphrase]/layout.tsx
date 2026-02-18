import Header from '@/app/_common/navbar'
import Navigation from '@/app/_common/navigation'
import ElevenLabsWidget from '@/app/_tts/elevenlabs-widget'
import { SignOutButton } from '@/app/mentor/_components/signout-button'
import { Home } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import { PropsWithChildren } from 'react'

export default async function LearnerPassphraseLayout({
	children,
	params,
}: PropsWithChildren<{
	params: Promise<{ passphrase: string }>
}>) {
	const { passphrase } = await params

	return (
		<>
			<Header>
				<Link href="/learner">
					<Home className="h-6 w-6 text-brand" />
				</Link>
				<Navigation basePath={`/learner/${passphrase}`} />
				<SignOutButton />
			</Header>
			<Script
				src="https://unpkg.com/@elevenlabs/convai-widget-embed"
				async
				type="text/javascript"
			></Script>
			<ElevenLabsWidget
				agentId="agent_01jxr34ba0esfs9gp69ar7b3vq"
				baseUrl={`/learner/${passphrase}`}
			/>
			{children}
		</>
	)
}
