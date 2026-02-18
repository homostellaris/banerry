import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import Logo from '@/app/_common/logo'
import SignInForm from './_components/signin-form'

export default function SignIn() {
	return (
		<div className="flex min-h-screen items-center justify-center p-6 bg-background">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-2">
						<Logo className="h-16 w-16" />
					</div>
					<CardTitle className="text-2xl font-bold text-brand">
						Banerry
					</CardTitle>
					<CardDescription>
						{/* Sign in to access your communication assistance */}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SignInForm />
				</CardContent>
			</Card>
		</div>
	)
}
