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
import { Target, Loader2 } from 'lucide-react'
import posthog from 'posthog-js'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

interface AddTargetScriptFormProps {
	learnerId: Id<'learners'>
}

export default function AddTargetScriptForm({
	learnerId,
}: AddTargetScriptFormProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [dialogue, setDialogue] = useState('')
	const [parentheticals, setParentheticals] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const createTargetScript = useMutation(api.targetScripts.create)
	const targetScriptCount = useQuery(api.targetScripts.count, { learnerId })

	const isAtLimit = targetScriptCount !== undefined && targetScriptCount >= 3

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!dialogue.trim() || isAtLimit) return

		setIsSubmitting(true)
		try {
			const result = await createTargetScript({
				dialogue: dialogue.trim(),
				parentheticals: parentheticals.trim(),
				learnerId: learnerId,
			})

			if (result === null) {
				alert('Cannot add more than 3 target scripts per learner.')
				return
			}

			posthog.capture('target_script_created', {
				has_parentheticals: parentheticals.trim().length > 0,
			})

			setDialogue('')
			setParentheticals('')
			setIsOpen(false)
		} catch (error) {
			console.error('Failed to create target script:', error)
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
					variant="outline"
					disabled={isAtLimit}
					title={
						isAtLimit ? 'Maximum 3 target scripts allowed' : 'Add Target Script'
					}
				>
					<Target className="h-4 w-4" />
					Add Target Script{' '}
					{targetScriptCount !== undefined && `(${targetScriptCount}/3)`}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Target Script</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="dialogue">Target Script Dialogue *</Label>
						<Input
							id="dialogue"
							value={dialogue}
							onChange={e => setDialogue(e.target.value)}
							placeholder="Enter the target script text..."
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="parentheticals">Context/Parentheticals</Label>
						<Textarea
							id="parentheticals"
							value={parentheticals}
							onChange={e => setParentheticals(e.target.value)}
							placeholder="Add context about when and how this target script should be used..."
							rows={3}
						/>
					</div>
					{isAtLimit && (
						<div className="text-sm text-red-600 bg-red-50 p-2 rounded">
							Maximum 3 target scripts allowed per learner.
						</div>
					)}
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
							disabled={!dialogue.trim() || isSubmitting || isAtLimit}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								'Create Target Script'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
