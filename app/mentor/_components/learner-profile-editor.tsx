'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Loader2, Save, User, Sparkles, Info } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { toast } from 'sonner'
import { ImageStyle } from '@/app/_image-generation/image-generation'

interface LearnerProfileEditorProps {
	learnerId: Id<'learners'>
	learnerName: string
	initialBio?: string
	initialAvatarStorageId?: Id<'_storage'>
	initialAvatarPrompt?: string
}

const AVATAR_STYLE_OPTIONS: Array<{
	value: ImageStyle
	label: string
	description: string
}> = [
	{
		value: 'studio-ghibli',
		label: 'Studio Ghibli',
		description: 'Digital art with vibrant colors',
	},
	{
		value: 'play-doh',
		label: 'Play-Doh',
		description: 'Soft tactile textures',
	},
	{
		value: 'ladybird',
		label: 'Ladybird Books',
		description: 'Classic 1960s illustration',
	},
	{
		value: 'symbols',
		label: 'Symbols (AAC)',
		description: 'Simple AAC-style symbols',
	},
]

export default function LearnerProfileEditor({
	learnerId,
	learnerName,
	initialBio,
	initialAvatarStorageId,
	initialAvatarPrompt,
}: LearnerProfileEditorProps) {
	const [bio, setBio] = useState(initialBio ?? '')
	const [avatarPrompt, setAvatarPrompt] = useState(initialAvatarPrompt ?? '')
	const [avatarStyle, setAvatarStyle] = useState<ImageStyle>('studio-ghibli')
	const [isSaving, setIsSaving] = useState(false)
	const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false)
	const [pendingAvatarStorageId, setPendingAvatarStorageId] = useState<
		Id<'_storage'> | undefined
	>(initialAvatarStorageId)

	const updateProfile = useMutation(api.learners.updateProfile)
	const generateUploadUrl = useMutation(api.boards.generateUploadUrl)

	const avatarUrl = useQuery(
		api.learners.getStorageUrl,
		pendingAvatarStorageId ? { storageId: pendingAvatarStorageId } : 'skip',
	)

	const hasChanges =
		bio !== (initialBio ?? '') ||
		pendingAvatarStorageId !== initialAvatarStorageId ||
		avatarPrompt !== (initialAvatarPrompt ?? '')

	const handleGenerateAvatar = async () => {
		if (!avatarPrompt.trim()) {
			toast.error('Please enter a description for the avatar')
			return
		}

		setIsGeneratingAvatar(true)

		try {
			const fullPrompt = `Full-body portrait of ${avatarPrompt}. Standing in a neutral pose, front-facing, clear and well-lit, simple plain background. The character should be clearly visible from head to toe.`

			const result = await fetch('/api/generate-image', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: fullPrompt,
					size: '1024x1024',
					style: avatarStyle,
				}),
			}).then(r => r.json())

			if (!result.success) {
				toast.error(result.error || 'Failed to generate avatar')
				return
			}

			const base64Response = await fetch(
				`data:image/png;base64,${result.imageData}`,
			)
			const blob = await base64Response.blob()

			const uploadUrl = await generateUploadUrl()
			const uploadResponse = await fetch(uploadUrl, {
				method: 'POST',
				headers: { 'Content-Type': blob.type },
				body: blob,
			})

			const { storageId } = await uploadResponse.json()
			setPendingAvatarStorageId(storageId)

			toast.success("Avatar generated! Click 'Save Changes' to keep it.")
		} catch (error) {
			console.error('Failed to generate avatar:', error)
			toast.error('Failed to generate avatar')
		} finally {
			setIsGeneratingAvatar(false)
		}
	}

	const handleSave = async () => {
		setIsSaving(true)
		try {
			await updateProfile({
				learnerId,
				bio: bio || undefined,
				avatarStorageId: pendingAvatarStorageId,
				avatarPrompt: avatarPrompt || undefined,
			})
			toast.success('Profile saved successfully')
		} catch (error) {
			console.error('Failed to save profile:', error)
			toast.error('Failed to save profile')
		} finally {
			setIsSaving(false)
		}
	}

	const displayAvatarUrl = pendingAvatarStorageId ? avatarUrl : null

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					About {learnerName}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="bio">Bio</Label>
					<Textarea
						id="bio"
						value={bio}
						onChange={e => setBio(e.target.value)}
						placeholder="Interests, preferences, helpful context..."
						rows={3}
						data-name="bio-input"
					/>
					<p className="text-sm text-muted-foreground">
						General information about the learner (interests, preferences, etc.)
					</p>
				</div>

				<div className="space-y-4">
					<Label>Avatar</Label>

					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-shrink-0">
							<div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
								{isGeneratingAvatar ? (
									<div className="text-center">
										<Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
										<p className="text-xs text-gray-500 mt-2">Generating...</p>
									</div>
								) : displayAvatarUrl ? (
									<img
										src={displayAvatarUrl}
										alt="Avatar"
										className="w-full h-full object-cover"
										data-name="avatar-preview"
									/>
								) : (
									<div className="text-center text-gray-400">
										<User className="h-8 w-8 mx-auto" />
										<p className="text-xs mt-1">No avatar</p>
									</div>
								)}
							</div>
						</div>

						<div className="flex-1 space-y-3">
							<div className="space-y-2">
								<Label htmlFor="avatarStyle">Style</Label>
								<Select
									value={avatarStyle}
									onValueChange={value => setAvatarStyle(value as ImageStyle)}
								>
									<SelectTrigger
										id="avatarStyle"
										data-name="avatar-style-select"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{AVATAR_STYLE_OPTIONS.map(option => (
											<SelectItem
												key={option.value}
												value={option.value}
											>
												<div className="flex flex-col items-start">
													<span>{option.label}</span>
													<span className="text-xs text-muted-foreground">
														{option.description}
													</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="avatarPrompt">Describe appearance</Label>
								<Textarea
									id="avatarPrompt"
									value={avatarPrompt}
									onChange={e => setAvatarPrompt(e.target.value)}
									placeholder="e.g., 7-year-old boy with short brown hair, brown eyes, wearing a green dinosaur t-shirt and khaki shorts"
									rows={2}
									data-name="avatar-prompt-input"
								/>
							</div>

							<Button
								onClick={handleGenerateAvatar}
								disabled={!avatarPrompt.trim() || isGeneratingAvatar}
								variant="outline"
								className="w-full"
								data-name="generate-avatar-button"
							>
								{isGeneratingAvatar ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Generating...
									</>
								) : (
									<>
										<Sparkles className="h-4 w-4 mr-2" />
										Generate Avatar
									</>
								)}
							</Button>
						</div>
					</div>

					<div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
						<Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
						<p>
							This avatar will be used as a reference for all board images,
							ensuring the same character appears consistently across all
							generated visuals.
						</p>
					</div>
				</div>

				<div className="flex justify-end">
					<Button
						onClick={handleSave}
						disabled={!hasChanges || isSaving}
						data-name="save-profile-button"
					>
						{isSaving ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								Save Changes
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
