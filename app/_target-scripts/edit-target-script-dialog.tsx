'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'

interface EditTargetScriptDialogProps {
	state: [boolean, Dispatch<SetStateAction<boolean>>]
	targetScript: Doc<'targetScripts'>
}

export default function EditTargetScriptDialog({
	state,
	targetScript,
}: EditTargetScriptDialogProps) {
	const [dialogue, setDialogue] = useState(targetScript.dialogue)
	const [parentheticals, setParentheticals] = useState(
		targetScript.parentheticals,
	)
	const [isUpdating, setIsUpdating] = useState(false)
	const updateTargetScript = useMutation(api.targetScripts.update)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!dialogue.trim()) {
			toast.error('Dialogue is required')
			return
		}

		try {
			setIsUpdating(true)
			await updateTargetScript({
				id: targetScript._id,
				dialogue: dialogue.trim(),
				parentheticals: parentheticals.trim(),
			})
			toast.success('Target script updated successfully')
			state[1](false)
		} catch (error) {
			console.error('Error updating target script:', error)
			toast.error('Failed to update target script')
		} finally {
			setIsUpdating(false)
		}
	}

	return (
		<DialogContent
			className="sm:max-w-[500px]"
			// https://github.com/radix-ui/primitives/issues/1241#issuecomment-2932189460
			onCloseAutoFocus={event => {
				event.preventDefault()
				document.body.style.pointerEvents = ''
			}}
		>
			<DialogHeader>
				<DialogTitle>Edit Target Script</DialogTitle>
				<DialogDescription>
					Update the dialogue and parentheticals for this target script.
				</DialogDescription>
			</DialogHeader>
			<form onSubmit={handleSubmit}>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="dialogue">Dialogue</Label>
						<Input
							id="dialogue"
							value={dialogue}
							onChange={e => {
								setDialogue(e.target.value)
							}}
							placeholder="Enter the target script dialogue..."
							required
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="parentheticals">Parentheticals</Label>
						<Textarea
							id="parentheticals"
							value={parentheticals}
							onChange={e => setParentheticals(e.target.value)}
							placeholder="Enter context or meaning..."
							rows={3}
						/>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button
							type="button"
							variant="outline"
							onClick={() => state[1](false)}
							disabled={isUpdating}
						>
							Cancel
						</Button>
					</DialogClose>
					<Button
						type="submit"
						disabled={isUpdating}
					>
						{isUpdating ? 'Updating...' : 'Update Target Script'}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	)
}
