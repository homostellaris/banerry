import AddLearnerForm from '@/app/mentor/_components/add-learner-form'
import { api } from '@/convex/_generated/api'
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { preloadQuery } from 'convex/nextjs'
import Header from '../_common/navbar'
import HomeButton from '../_common/home-button'
import HelpPopover from '../_common/help-popover'
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
				<HomeButton href="/mentor" />
				<div className="flex gap-1 items-center self-center">
					<SignOutButton />
					<HelpPopover />
				</div>
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
