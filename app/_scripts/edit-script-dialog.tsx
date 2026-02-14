'use client'

import { Button } from '@/components/ui/button'
import {
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

interface EditScriptDialogProps {
	state: [boolean, Dispatch<SetStateAction<boolean>>]
	script: Doc<'scripts'>
}

export default function EditScriptDialog({
	state,
	script,
}: EditScriptDialogProps) {
	const [dialogue, setDialogue] = useState(script.dialogue)
	const [parentheticals, setParentheticals] = useState(script.parentheticals)
	const [isUpdating, setIsUpdating] = useState(false)
	const updateScript = useMutation(api.scripts.update)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!dialogue.trim()) {
			toast.error('Dialogue is required')
			return
		}

		try {
			setIsUpdating(true)
			await updateScript({
				id: script._id,
				dialogue: dialogue.trim(),
				parentheticals: parentheticals.trim(),
			})
			toast.success('Script updated successfully')
			state[1](false)
		} catch (error) {
			console.error('Error updating script:', error)
			toast.error('Failed to update script')
		} finally {
			setIsUpdating(false)
		}
	}

	return (
		<DialogContent
			className="sm:max-w-[500px]"
			onCloseAutoFocus={event => {
				event.preventDefault()
				document.body.style.pointerEvents = ''
			}}
		>
			<DialogHeader>
				<DialogTitle>Edit Script</DialogTitle>
				<DialogDescription>
					Update the dialogue and parentheticals for this script.
				</DialogDescription>
			</DialogHeader>
			<form onSubmit={handleSubmit}>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="dialogue">Dialogue</Label>
						<Input
							id="dialogue"
							value={dialogue}
							onChange={e => setDialogue(e.target.value)}
							placeholder="Enter the script dialogue..."
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
					<Button
						type="button"
						variant="outline"
						onClick={() => state[1](false)}
						disabled={isUpdating}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isUpdating}
					>
						{isUpdating ? 'Updating...' : 'Update Script'}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	)
}
