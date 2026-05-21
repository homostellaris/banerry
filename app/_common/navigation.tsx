'use client'

import { cn } from '@/lib/utils'
import {
	BookOpen,
	ChevronsUpDown,
	Clock,
	Columns3,
	LayoutGrid,
	Palette,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

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

	const isItemActive = (item: NavigationItem) => {
		if (!pathname) return false
		return item.exact ? pathname === item.href : pathname.startsWith(item.href)
	}

	const activeItem = items.find(isItemActive) ?? items[0]

	return (
		<nav className="flex-1 h-full">
			{/* Mobile: dropdown */}
			<div className="md:hidden flex items-center justify-center h-full">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="gap-1.5 px-2 font-medium text-sm"
						>
							<activeItem.icon className="h-4 w-4 shrink-0" />
							<span>{activeItem.name}</span>
							<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-44">
						{items.map(item => (
							<DropdownMenuItem
								key={item.name}
								asChild
								className={cn(
									isItemActive(item) && 'bg-accent text-accent-foreground',
								)}
							>
								<Link href={item.href}>
									<item.icon className="h-4 w-4" />
									{item.name}
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Desktop: tabs */}
			<div className="hidden md:flex justify-center overflow-x-auto scrollbar-hide h-full">
				{items.map(item => (
					<Link
						key={item.name}
						href={item.href}
						className={cn(
							'flex items-center gap-2 px-4 h-full text-sm font-medium whitespace-nowrap border-b-2 transition-colors hover:text-brand',
							isItemActive(item)
								? 'border-brand text-brand'
								: 'border-transparent text-gray-600 hover:border-brand/30',
						)}
					>
						<item.icon className="h-4 w-4" />
						<span>{item.name}</span>
					</Link>
				))}
			</div>
		</nav>
	)
}
