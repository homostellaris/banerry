import HelpPopover from '@/app/_common/help-popover'
import HomeButton from '@/app/_common/home-button'
import Navigation from '@/app/_common/navigation'
import ElevenLabsNavButton from '@/app/_tts/elevenlabs-nav-button'
import { PropsWithChildren } from 'react'
import Header from '../../../_common/navbar'
import { SignOutButton } from '../../_components/signout-button'

export default async function Layout({
	children,
	params,
}: PropsWithChildren<{
	params: Promise<{ id: string }>
}>) {
	const { id } = await params

	return (
		<>
			<Header>
				<div className="flex items-center">
					<HomeButton href="/mentor" />
					<ElevenLabsNavButton />
				</div>
				<Navigation basePath={`/mentor/learner/${id}`} />
				<div className="flex gap-1 items-center self-center">
					<SignOutButton />
					<HelpPopover />
				</div>
			</Header>
			{children}
		</>
	)
}
