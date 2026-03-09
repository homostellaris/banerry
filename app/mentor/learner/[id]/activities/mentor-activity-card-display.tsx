'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Loader2, Pencil, Sparkles, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'

export function MentorActivityCardDisplay({
	title,
	imageUrl,
	defaultPrompt = '',
	audioButton,
	onSelect,
	onSaveTitle,
	onGenerateImage,
}: {
	title: string
	imageUrl: string | null | undefined
	defaultPrompt?: string
	audioButton?: ReactNode
	onSelect: () => void
	onSaveTitle: (title: string) => Promise<void>
	onGenerateImage: (prompt: string) => Promise<void>
}) {
	const [isEditingTitle, setIsEditingTitle] = useState(false)
	const [titleInput, setTitleInput] = useState(title)
	const [showImagePrompt, setShowImagePrompt] = useState(false)
	const [promptInput, setPromptInput] = useState(defaultPrompt)
	const [isGenerating, setIsGenerating] = useState(false)

	const handleSaveTitle = async () => {
		const trimmed = titleInput.trim()
		if (!trimmed || trimmed === title) {
			setTitleInput(title)
			setIsEditingTitle(false)
			return
		}
		try {
			await onSaveTitle(trimmed)
			setIsEditingTitle(false)
		} catch {
			toast.error('Failed to update title')
		}
	}

	const handleGenerateImage = async () => {
		if (!promptInput.trim()) {
			toast.error('Please enter a prompt')
			return
		}
		setIsGenerating(true)
		try {
			await onGenerateImage(promptInput)
			setShowImagePrompt(false)
			toast.success('Image updated!')
		} catch {
			toast.error('Failed to generate image')
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<div
			className="flex flex-col rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
			data-name="activity-card"
		>
			{/* Image */}
			<button
				className="aspect-square w-full cursor-pointer hover:opacity-90 transition-opacity relative group"
				onClick={() => !showImagePrompt && onSelect()}
				aria-label={title}
				data-name="activity-image-button"
			>
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={title}
						className="w-full h-full object-cover"
						data-name="activity-image"
					/>
				) : (
					<div className="w-full h-full bg-gray-100 flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
					</div>
				)}
				{isGenerating && (
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
						<Loader2 className="h-8 w-8 text-white animate-spin" />
					</div>
				)}
				<div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						size="icon"
						variant="secondary"
						className="h-8 w-8 rounded-full"
						onClick={e => {
							e.stopPropagation()
							setShowImagePrompt(v => !v)
						}}
						aria-label="Change image"
						data-name="activity-change-image-button"
					>
						<Sparkles className="h-4 w-4" />
					</Button>
				</div>
			</button>

			{/* Image prompt input */}
			{showImagePrompt && (
				<div
					className="flex gap-1 px-2 py-2 bg-gray-50 border-t border-gray-100"
					data-name="activity-image-prompt-area"
				>
					<Input
						placeholder="Describe new image…"
						value={promptInput}
						onChange={e => setPromptInput(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') handleGenerateImage()
							if (e.key === 'Escape') setShowImagePrompt(false)
						}}
						className="h-8 text-xs"
						autoFocus
						data-name="activity-image-prompt-input"
					/>
					<Button
						size="icon"
						className="h-8 w-8 flex-shrink-0"
						onClick={handleGenerateImage}
						disabled={isGenerating}
						data-name="activity-generate-image-button"
					>
						{isGenerating ? (
							<Loader2 className="h-3 w-3 animate-spin" />
						) : (
							<Sparkles className="h-3 w-3" />
						)}
					</Button>
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8 flex-shrink-0"
						onClick={() => setShowImagePrompt(false)}
						data-name="activity-cancel-image-button"
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			)}

			{/* Title footer */}
			{isEditingTitle ? (
				<div className="flex gap-1 items-center px-2 py-2 bg-white border-t border-gray-100">
					<Input
						value={titleInput}
						onChange={e => setTitleInput(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') handleSaveTitle()
							if (e.key === 'Escape') {
								setTitleInput(title)
								setIsEditingTitle(false)
							}
						}}
						className="h-8 text-xs flex-1"
						autoFocus
						data-name="activity-title-input"
					/>
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8 flex-shrink-0 text-green-600"
						onClick={handleSaveTitle}
						data-name="activity-save-title-button"
					>
						<Check className="h-3 w-3" />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8 flex-shrink-0"
						onClick={() => {
							setTitleInput(title)
							setIsEditingTitle(false)
						}}
						data-name="activity-cancel-title-button"
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			) : (
				<div className="flex items-center gap-2 px-3 py-3 bg-white" data-name="activity-footer">
					<p
						className="flex-1 text-sm font-medium truncate"
						data-name="activity-title"
					>
						{title}
					</p>
					<Button
						size="icon"
						variant="ghost"
						className="h-7 w-7 flex-shrink-0 text-gray-400 hover:text-brand"
						onClick={() => {
							setTitleInput(title)
							setIsEditingTitle(true)
						}}
						aria-label="Edit title"
						data-name="activity-edit-title-button"
					>
						<Pencil className="h-3 w-3" />
					</Button>
					{audioButton}
				</div>
			)}
		</div>
	)
}
