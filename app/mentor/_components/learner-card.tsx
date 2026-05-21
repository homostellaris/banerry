'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreVertical, Pencil, User } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface LearnerCardProps {
	learner: {
		_id: string
		name: string
		bio?: string
		avatarStorageId?: Id<'_storage'>
		_creationTime: number
	}
}

export default function LearnerCard({ learner }: LearnerCardProps) {
	const avatarUrl = useQuery(
		api.learners.getStorageUrl,
		learner.avatarStorageId ? { storageId: learner.avatarStorageId } : 'skip',
	)

	return (
		<div className="relative" data-name="learner-card">
			<Link
				href={`/mentor/learner/${learner._id}/scripts`}
				className="block"
			>
				<Card className="overflow-hidden border-2 border-brand/20 shadow-md hover:shadow-lg transition-shadow h-full">
					<CardHeader className="pb-3">
						<div className="flex items-center gap-3 pr-8">
							{avatarUrl ? (
								<img
									src={avatarUrl}
									alt={`${learner.name}'s avatar`}
									className="h-9 w-9 rounded-full object-cover"
								/>
							) : (
								<div className="rounded-full bg-brand/10 p-2">
									<User className="h-5 w-5 text-brand" />
								</div>
							)}
							<CardTitle className="text-xl font-bold text-gray-800">
								{learner.name}
							</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="pt-0">
						<p className="text-xs text-gray-400"></p>
					</CardContent>
				</Card>
			</Link>
			<div className="absolute top-7 right-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							data-name="learner-card-menu"
							aria-label="Learner options"
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<Link
								href={`/mentor/learner/${learner._id}`}
								data-name="learner-card-edit"
							>
								<Pencil className="h-4 w-4" />
								Edit
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	)
}
