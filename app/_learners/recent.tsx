import Link from 'next/link'
import useRecentPassphrase from './use-recent-passphrase'

export default function RecentLearners() {
	const passphrase = useRecentPassphrase()

	return (
		<>
			{passphrase && (
				<Link
					href={`/learner/${passphrase}`}
					className="flex items-center gap-2 underline text-blue-600 hover:text-blue-800 visited:text-brand"
				>
					{passphrase}
				</Link>
			)}
		</>
	)
}
