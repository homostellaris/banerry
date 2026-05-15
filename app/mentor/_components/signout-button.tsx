'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { Authenticated } from 'convex/react'
import { LogOut } from 'lucide-react'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
	const { signOut } = useAuthActions()

	const handleSignOut = () => {
		posthog.capture('sign_out_clicked')
		localStorage.removeItem('posthog_consent')
		posthog.reset()
		void signOut()
	}

	return (
		<Authenticated>
			<Button
				variant="ghost"
				size="icon"
				aria-label="Sign out"
				className="text-gray-600 hover:text-brand"
				onClick={handleSignOut}
			>
				<LogOut className="h-6 w-6" />
			</Button>
		</Authenticated>
	)
}
