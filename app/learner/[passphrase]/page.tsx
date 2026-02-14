import { redirect } from 'next/navigation'

export default async function LearnerPage({
	params,
}: {
	params: Promise<{ passphrase: string }>
}) {
	const { passphrase } = await params
	redirect(`/learner/${passphrase}/scripts`)
}
