'use client'

import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, X } from 'lucide-react'
import { toast } from 'sonner'

interface MentorsListProps {
	learnerId: Id<'learners'>
}

export default function MentorsList({ learnerId }: MentorsListProps) {
	const mentors = useQuery(api.learners.getMentors, { learnerId })
	const removeMentor = useMutation(api.learners.removeMentor)

	const handleRemoveMentor = async (mentorId: Id<'users'>) => {
		try {
			const result = await removeMentor({
				learnerId,
				mentorId,
			})

			if (result.success) {
				toast.success(result.message)
			} else {
				toast.error(result.message)
			}
		} catch (error) {
			console.error('Failed to remove mentor:', error)
			toast.error('Failed to remove mentor. Please try again.')
		}
	}

	if (!mentors) {
		return <div>Loading mentors...</div>
	}

	if (mentors.length === 0) {
		return <div className="text-gray-500">No mentors found</div>
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<User className="h-5 w-5" />
					Mentors ({mentors.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{mentors.map(mentor => (
						<div
							key={mentor._id}
							className="flex items-center gap-2 p-2 rounded-md bg-gray-50"
						>
							<div className="rounded-full bg-brand/10 p-1">
								<User className="h-3 w-3 text-brand" />
							</div>
							<div className="flex-1">
								<div className="text-sm text-gray-600">{mentor.email}</div>
							</div>
							{mentors.length > 1 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleRemoveMentor(mentor._id)}
									className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
								>
									<X className="h-3 w-3" />
								</Button>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
