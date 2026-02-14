'use client'

import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Share, Loader2 } from 'lucide-react'
import posthog from 'posthog-js'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { toast } from 'sonner'

interface ShareLearnerFormProps {
	learnerId: Id<'learners'>
	learnerName?: string
}

export default function ShareLearnerForm({
	learnerId,
	learnerName,
}: ShareLearnerFormProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [email, setEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const shareLearner = useMutation(api.learners.share)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!email.trim()) return

		setIsSubmitting(true)
		try {
			const result = await shareLearner({
				learnerId,
				email: email.trim(),
			})

			if (result.success) {
				posthog.capture('learner_shared', {
					is_invitation: result.isInvitation,
				})
				if (result.isInvitation) {
					toast.success(result.message, {
						description:
							'They will receive an email with instructions to join.',
						duration: 5000,
					})
				} else {
					toast.success(result.message)
				}
				setEmail('')
				setIsOpen(false)
			} else {
				toast.error(result.message)
			}
		} catch (error) {
			console.error('Failed to share learner:', error)
			toast.error('Failed to share learner. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCancel = () => {
		setEmail('')
		setIsOpen(false)
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="flex items-center gap-2"
				>
					<Share className="h-4 w-4" />
					Share
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						Share {learnerName ? `"${learnerName}"` : 'Learner'}
					</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							value={email}
							type="email"
							onChange={e => setEmail(e.target.value)}
							placeholder="Enter mentor's email"
							required
						/>
						<p className="text-sm text-gray-500">
							Enter the email address of someone you&apos;d like to share this
							learner with. If they don&apos;t have a Banerry account yet,
							they&apos;ll receive an invitation email.
						</p>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!email.trim() || isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Sharing...
								</>
							) : (
								'Share Learner'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
