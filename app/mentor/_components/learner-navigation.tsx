'use client'

import Navigation from '@/app/_common/navigation'
import { usePathname } from 'next/navigation'

export default function LearnerNavigation({ id }: { id: string }) {
	const pathname = usePathname()
	if (pathname === `/mentor/learner/${id}`) return null
	return <Navigation basePath={`/mentor/learner/${id}`} />
}
