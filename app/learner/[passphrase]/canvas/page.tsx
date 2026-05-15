'use client'

import CanvasBoard from '@/app/_canvas/canvas-board'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { useEffect, useState } from 'react'

export default function CanvasPage({
	params,
}: {
	params: Promise<{ passphrase: string }>
}) {
	const [passphrase, setPassphrase] = useState('')

	useEffect(() => {
		params.then(p => setPassphrase(p.passphrase))
	}, [params])

	const learner = useQuery(
		api.learners.getLearnerByPassphrase,
		passphrase ? { passphrase } : 'skip',
	)

	if (!learner) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
			</div>
		)
	}

	return (
		<div className="flex flex-col" style={{ height: 'calc(100dvh - 3.5rem)' }}>
			<CanvasBoard learnerId={learner._id} />
		</div>
	)
}
