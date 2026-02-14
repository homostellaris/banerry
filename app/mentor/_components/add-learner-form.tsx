'use client'

import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import posthog from 'posthog-js'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'

export default function AddLearnerForm() {
	const [isOpen, setIsOpen] = useState(false)
	const [name, setName] = useState('')
	const [bio, setBio] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const router = useRouter()
	const createLearner = useMutation(api.learners.create)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim()) return

		setIsSubmitting(true)
		try {
			const learnerId = await createLearner({
				name: name.trim(),
				bio: bio.trim() || undefined,
			})

			posthog.capture('learner_created', {
				has_bio: bio.trim().length > 0,
			})

			setName('')
			setBio('')
			setIsOpen(false)
			router.push(`/mentor/learner/${learnerId}`)
		} catch (error) {
			console.error('Failed to create learner:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCancel = () => {
		setName('')
		setBio('')
		setIsOpen(false)
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogTrigger asChild>
				<Button
					className="flex items-center gap-2"
					data-name="add-learner-button"
				>
					<Plus className="h-4 w-4" />
					Add Learner
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Learner</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="name">Name *</Label>
						<Input
							id="name"
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Enter learner's name"
							required
							data-name="learner-name-input"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="bio">Bio (optional)</Label>
						<Textarea
							id="bio"
							value={bio}
							onChange={e => setBio(e.target.value)}
							placeholder="Tell us about this learner..."
							rows={3}
							data-name="learner-bio-input"
						/>
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
							disabled={!name.trim() || isSubmitting}
							data-name="create-learner-submit"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								'Create Learner'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
