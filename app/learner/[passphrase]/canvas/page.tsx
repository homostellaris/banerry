'use client'

import React, { useEffect, useState } from 'react'
import { CanvasPageContent } from '@/app/_canvas/canvas-page-content'

export default function CanvasPage({
	params,
}: {
	params: Promise<{ passphrase: string }>
}) {
	const [passphrase, setPassphrase] = useState<string>('')

	useEffect(() => {
		params.then(p => setPassphrase(p.passphrase))
	}, [params])

	if (!passphrase) {
		return (
			<div className="container mx-auto p-4 max-w-4xl text-center text-gray-500">
				Loading canvas...
			</div>
		)
	}

	return <CanvasPageContent passphrase={passphrase} />
}
