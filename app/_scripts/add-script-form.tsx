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
import { Id } from '@/convex/_generated/dataModel'

interface AddScriptFormProps {
	learnerId: Id<'learners'>
}

export default function AddScriptForm({ learnerId }: AddScriptFormProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [dialogue, setDialogue] = useState('')
	const [parentheticals, setParentheticals] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const createScript = useMutation(api.scripts.create)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!dialogue.trim()) return

		setIsSubmitting(true)
		try {
			await createScript({
				dialogue: dialogue.trim(),
				parentheticals: parentheticals.trim(),
				learnerId: learnerId,
			})

			posthog.capture('script_created', {
				has_parentheticals: parentheticals.trim().length > 0,
			})

			setDialogue('')
			setParentheticals('')
			setIsOpen(false)
		} catch (error) {
			console.error('Failed to create script:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCancel = () => {
		setDialogue('')
		setParentheticals('')
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
					data-name="add-script-button"
				>
					<Plus className="h-4 w-4" />
					Add Script
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Script</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="dialogue">Script Dialogue *</Label>
						<Input
							id="dialogue"
							value={dialogue}
							onChange={e => setDialogue(e.target.value)}
							placeholder="Enter the script text..."
							required
							data-name="script-dialogue-input"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="parentheticals">Context/Parentheticals</Label>
						<Textarea
							id="parentheticals"
							value={parentheticals}
							onChange={e => setParentheticals(e.target.value)}
							placeholder="Add context about when and how this script is used..."
							rows={3}
							data-name="script-parentheticals-input"
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
							disabled={!dialogue.trim() || isSubmitting}
							data-name="create-script-submit"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								'Create Script'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
