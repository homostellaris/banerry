import Navigation from '@/app/_common/navigation'
import { Home } from 'lucide-react'
import Link from 'next/link'
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
				<Link href="/mentor">
					<Home className="h-6 w-6 text-purple-700" />
				</Link>
				<Navigation basePath={`/mentor/learner/${id}`} />
				<SignOutButton />
			</Header>
			{children}
		</>
	)
}
