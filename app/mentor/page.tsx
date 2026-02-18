import AddLearnerForm from '@/app/mentor/_components/add-learner-form'
import { api } from '@/convex/_generated/api'
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { preloadQuery } from 'convex/nextjs'
import { Home } from 'lucide-react'
import Link from 'next/link'
import Header from '../_common/header'
import Learners from './_components/learners'
import { SignOutButton } from './_components/signout-button'

export default async function MentorPage() {
	const preloadedLearners = await preloadQuery(
		api.learners.list,
		{},
		{
			token: await convexAuthNextjsToken(),
		},
	)

	return (
		<>
			<Header>
				<Link href="/mentor">
					<Home className="h-6 w-6 text-brand" />
				</Link>
				<SignOutButton />
			</Header>
			<div className="container mx-auto p-4 sm:p-6 max-w-4xl">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Learners</h1>
					<AddLearnerForm />
				</div>
				<Learners preloadedLearners={preloadedLearners} />
			</div>
		</>
	)
}
