import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import Link from 'next/link'

export default function HomeButton({ href }: { href: string }) {
	return (
		<Button
			variant="ghost"
			size="icon"
			className="self-center text-gray-600 hover:text-brand"
			asChild
		>
			<Link href={href}>
				<Home className="h-6 w-6" />
			</Link>
		</Button>
	)
}
