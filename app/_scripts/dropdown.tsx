'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Doc } from '@/convex/_generated/dataModel'
import { Edit3, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import DeleteScriptButton from './delete-script-button'
import EditScriptDialog from './edit-script-dialog'

export function Dropdown({ script }: { script: Doc<'scripts'> }) {
	const [dialog, setDialog] = useState<'edit' | 'delete' | null>()

	return (
		<Dialog
			open={!!dialog}
			onOpenChange={open => setDialog(open ? dialog : null)}
		>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="ml-2"
					>
						<MoreVertical className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DialogTrigger asChild>
						<DropdownMenuItem
							onClick={e => {
								e.preventDefault()
								setDialog('edit')
							}}
							onSelect={e => e.preventDefault()}
						>
							<Edit3 className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
					</DialogTrigger>
					<DropdownMenuItem
						onSelect={e => e.preventDefault()}
						onClick={e => {
							e.preventDefault()
							setDialog('delete')
						}}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			{dialog === 'edit' && (
				<EditScriptDialog
					state={[dialog === 'edit', () => setDialog(undefined)]}
					script={script}
				/>
			)}
			<DeleteScriptButton
				state={[dialog === 'delete', () => setDialog(undefined)]}
				scriptId={script._id}
			/>
		</Dialog>
	)
}
