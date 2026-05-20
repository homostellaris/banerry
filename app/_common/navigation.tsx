'use client'

import { cn } from '@/lib/utils'
import { BookOpen, Clock, Columns3, LayoutGrid, Palette } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavigationItem = {
	name: string
	href: string
	icon: React.ComponentType<{ className?: string }>
	exact: boolean
}

export default function Navigation({
	basePath,
	additionalItems = [],
}: {
	basePath: string
	additionalItems?: NavigationItem[]
}) {
	const pathname = usePathname()

	const items = [
		{
			name: 'Scripts',
			href: `${basePath}/scripts`,
			icon: BookOpen,
			exact: true,
		},
		{
			name: 'Boards',
			href: `${basePath}/boards`,
			icon: Columns3,
			exact: false,
		},
		{
			name: 'Activities',
			href: `${basePath}/activities`,
			icon: LayoutGrid,
			exact: false,
		},
		{
			name: 'Timer',
			href: `${basePath}/timer`,
			icon: Clock,
			exact: false,
		},
		{
			name: 'Canvas',
			href: `${basePath}/canvas`,
			icon: Palette,
			exact: false,
		},
		...additionalItems,
	]

	return (
		<nav className="flex-1 h-full">
			<div className="flex justify-center overflow-x-auto scrollbar-hide h-full">
				{items.map(item => {
					const isActive = item.exact
						? pathname === item.href
						: pathname.startsWith(item.href)

					return (
						<Link
							key={item.name}
							href={item.href}
							className={cn(
								'flex items-center gap-1.5 px-3 py-1.5 rounded-md self-center text-sm font-medium whitespace-nowrap transition-colors',
								isActive
									? 'bg-brand/10 text-brand'
									: 'text-gray-600 hover:bg-brand/5 hover:text-brand',
							)}
						>
							<item.icon className="h-4 w-4" />
							<span className="hidden sm:inline">{item.name}</span>
						</Link>
					)
				})}
			</div>
		</nav>
	)
}
