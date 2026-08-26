'use client'

import React, { useRef } from 'react'
import posthog from 'posthog-js'
import { useCachedTTS } from '@/app/_tts/use-cached-tts'
import { CanvasBlockItemProps, CANVAS_DATA_NAMES } from './types'
import { formatBlockContent, getSpeechText } from './canvas-utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Camera } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import ScriptCard from '@/app/_scripts/script-card'
import AudioButton from '@/app/_tts/audio-button'

function ActivityBlockImage({
	imageStorageId,
	imageUrl,
	alt,
}: {
	imageStorageId?: Id<'_storage'> | string
	imageUrl?: string
	alt: string
}) {
	let storageUrl: string | null | undefined = null
	try {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		storageUrl = useQuery(
			api.boards.getImageUrl,
			imageStorageId ? { storageId: imageStorageId as Id<'_storage'> } : 'skip',
		)
	} catch {
		storageUrl = null
	}

	const src = imageUrl || storageUrl

	if (src) {
		return (
			<div className="w-full h-full aspect-square flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
				<img
					data-name="activity-block-image"
					src={src}
					alt={alt}
					style={{ objectFit: 'cover' }}
					className="w-full h-full object-cover rounded-lg"
				/>
			</div>
		)
	}

	return (
		<div
			data-name="activity-block-image"
			className="w-full h-full aspect-square rounded-lg bg-gray-100 flex flex-col items-center justify-center p-4 text-center select-none"
		>
			<Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
			<span className="text-sm font-semibold text-gray-500 truncate max-w-full">{alt}</span>
		</div>
	)
}

export function CanvasBlockItem({
	block,
	index = 0,
	totalBlocks = 1,
	isSelected,
	isEditingMode = true,
	readOnly = false,
	onTap,
	onSelect,
	onDelete,
	onMoveLeft,
	onMoveRight,
	onChangeScriptOrActivity,
}: CanvasBlockItemProps & {
	index?: number
	totalBlocks?: number
	onMoveLeft?: (id: string) => void
	onMoveRight?: (id: string) => void
}) {
	const { speak } = useCachedTTS()
	const lastTapRef = useRef<number>(0)

	const dataName = `${CANVAS_DATA_NAMES.BLOCK_PREFIX}${block.type}`
	const isEditing = isEditingMode === true && !readOnly
	const speechText = getSpeechText(block)

	const handleTap = (e: React.MouseEvent) => {
		e.stopPropagation()

		onTap?.(block)
		onSelect?.(block)

		const now = Date.now()
		if (now - lastTapRef.current < 350) {
			if (isEditing) {
				onChangeScriptOrActivity?.(block)
			}
		}
		lastTapRef.current = now

		if (speechText) {
			try {
				speak(speechText)?.catch?.(() => {})
			} catch {
				// ignore TTS in test environment
			}
			if (typeof window !== 'undefined' && (window as any).posthog?.capture) {
				;(window as any).posthog.capture('canvas_block_tapped', {
					blockType: block.type,
					content: block.content,
					speechText,
				})
			}
			try {
				posthog.capture('canvas_block_tapped', {
					blockType: block.type,
					content: block.content,
					speechText,
				})
			} catch {
				// ignore in test environment
			}
		}
	}

	const formattedContent = formatBlockContent(block)

	// Read Mode: Directly reuse ScriptCard for scripts, and Board column card layout for activities
	if (!isEditing) {
		if (block.type === 'script') {
			return (
				<div
					data-name={dataName}
					onClick={handleTap}
					className={`h-full transition-all duration-200 cursor-pointer rounded-xl ${
						isSelected ? 'ring-2 ring-brand shadow-md' : ''
					}`}
				>
					<ScriptCard
						script={{ dialogue: block.content || formattedContent }}
						className="h-full"
					/>
				</div>
			)
		}

		if (block.type === 'activity') {
			return (
				<Card
					data-name={dataName}
					onClick={handleTap}
					className={`relative transition-all duration-300 group hover:shadow-lg h-full flex flex-col border-2 border-brand/20 shadow-md rounded-xl overflow-hidden ${
						isSelected ? 'ring-2 ring-brand shadow-md bg-brand/5' : ''
					}`}
				>
					<CardHeader className="p-4 sm:p-5 pb-3">
						<div className="flex items-center justify-between gap-4">
							<h4
								className="text-left text-xl sm:text-2xl font-bold text-gray-800 flex-1 truncate"
								data-name="column-title"
							>
								{block.content || 'Activity'}
							</h4>
							<AudioButton
								text={block.content || 'Activity'}
								data-name={CANVAS_DATA_NAMES.BLOCK_SPEECH_BTN}
								className="rounded-full h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 bg-brand/10 hover:bg-brand/20 text-brand"
								iconClassName="h-6 w-6 sm:h-7 sm:w-7 text-brand"
							/>
						</div>
					</CardHeader>
					<CardContent className="p-4 sm:p-5 pt-0 flex-1 flex flex-col justify-center">
						<div
							className="relative aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 transition-colors overflow-hidden flex items-center justify-center"
							data-name="column-image-area"
						>
							<ActivityBlockImage
								imageStorageId={block.imageStorageId}
								imageUrl={block.imageUrl}
								alt={block.content || 'Activity'}
							/>
						</div>
					</CardContent>
				</Card>
			)
		}

		// Read Mode for Emoji, Letter, Number: Uses the clean Script Card layout with left content and right AudioButton
		return (
			<Card
				data-name={dataName}
				onClick={handleTap}
				className={`relative transition-all duration-300 group hover:shadow-lg h-full flex flex-col justify-between border-2 border-brand/20 shadow-md rounded-xl overflow-hidden ${
					isSelected ? 'ring-2 ring-brand shadow-md bg-brand/5' : ''
				}`}
			>
				<CardContent className="p-4 sm:p-5 h-full flex flex-col justify-between">
					<div className="flex items-center justify-between gap-4 h-full">
						<div className="flex-1 flex items-center justify-start text-left min-w-0">
							{block.type === 'emoji' && (
								<span className="text-5xl sm:text-6xl drop-shadow-sm transition-transform group-hover:scale-105 select-none">
									{block.content || '😀'}
								</span>
							)}
							{block.type === 'letter' && (
								<span className="text-5xl sm:text-6xl font-black text-blue-600 tracking-tight drop-shadow-sm transition-transform group-hover:scale-105 select-none">
									{block.content || 'A'}
								</span>
							)}
							{block.type === 'number' && (
								<span className="text-5xl sm:text-6xl font-black text-purple-600 tracking-tight drop-shadow-sm transition-transform group-hover:scale-105 select-none">
									{block.content || '1'}
								</span>
							)}
						</div>
						<div className="flex items-center shrink-0">
							<AudioButton
								text={speechText}
								data-name={CANVAS_DATA_NAMES.BLOCK_SPEECH_BTN}
								className="rounded-full h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 bg-brand/10 hover:bg-brand/20 text-brand"
								iconClassName="h-6 w-6 sm:h-7 sm:w-7 text-brand"
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	// Edit Mode: Clean cards with Reordering & Action buttons, NO numbering or labelling
	return (
		<Card
			data-name={dataName}
			onClick={handleTap}
			className={`relative transition-all duration-200 group cursor-pointer hover:shadow-lg rounded-xl overflow-hidden border-2 border-brand/20 shadow-md h-full flex flex-col ${
				isSelected
					? 'ring-2 ring-brand shadow-md bg-brand/5'
					: 'border-gray-200 hover:border-brand/40'
			}`}
		>
			{/* Card Header: Reorder Controls on Left & Action Buttons on Right (NO numbering or labelling) */}
			<CardHeader className="p-3 pb-2 flex flex-row items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/80">
				{/* Left: Accessible Reordering Controls */}
				<div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
					{onMoveLeft && index > 0 && (
						<>
							<Button
								data-name={CANVAS_DATA_NAMES.MOVE_LEFT_BTN}
								size="icon"
								variant="outline"
								className="hidden sm:inline-flex h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-gray-700 hover:bg-gray-100"
								onClick={() => onMoveLeft?.(block.id)}
								title="Move left"
								aria-label="Move left"
							>
								<ArrowLeft className="h-5 w-5" />
							</Button>
							<Button
								data-name={CANVAS_DATA_NAMES.MOVE_UP_BTN}
								size="icon"
								variant="outline"
								className="inline-flex sm:hidden h-9 w-9 rounded-lg text-gray-700 hover:bg-gray-100"
								onClick={() => onMoveLeft?.(block.id)}
								title="Move up"
								aria-label="Move up"
							>
								<ArrowUp className="h-5 w-5" />
							</Button>
						</>
					)}

					{onMoveRight && index < totalBlocks - 1 && (
						<>
							<Button
								data-name={CANVAS_DATA_NAMES.MOVE_RIGHT_BTN}
								size="icon"
								variant="outline"
								className="hidden sm:inline-flex h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-gray-700 hover:bg-gray-100"
								onClick={() => onMoveRight?.(block.id)}
								title="Move right"
								aria-label="Move right"
							>
								<ArrowRight className="h-5 w-5" />
							</Button>
							<Button
								data-name={CANVAS_DATA_NAMES.MOVE_DOWN_BTN}
								size="icon"
								variant="outline"
								className="inline-flex sm:hidden h-9 w-9 rounded-lg text-gray-700 hover:bg-gray-100"
								onClick={() => onMoveRight?.(block.id)}
								title="Move down"
								aria-label="Move down"
							>
								<ArrowDown className="h-5 w-5" />
							</Button>
						</>
					)}
				</div>

				{/* Right: Large Accessible Edit & Delete Action Buttons */}
				<div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
					{onChangeScriptOrActivity && (
						<Button
							size="sm"
							variant="outline"
							data-name={CANVAS_DATA_NAMES.EDIT_BLOCK_BTN}
							className="h-9 px-3 sm:h-10 sm:px-3.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-blue-200"
							onClick={() => onChangeScriptOrActivity(block)}
							title="Change item"
							aria-label="Change item"
						>
							<Pencil className="h-4 w-4" />
							<span>Change</span>
						</Button>
					)}

					{onDelete && (
						<Button
							size="sm"
							variant="outline"
							data-name={CANVAS_DATA_NAMES.DELETE_BLOCK_BTN}
							className="h-9 px-3 sm:h-10 sm:px-3.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs sm:text-sm flex items-center gap-1.5 border-rose-200"
							onClick={() => onDelete(block.id)}
							title="Delete block"
							aria-label="Delete block"
						>
							<Trash2 className="h-4 w-4" />
							<span>Delete</span>
						</Button>
					)}
				</div>
			</CardHeader>

			{/* Card Content Display in Edit Mode */}
			<CardContent onClick={handleTap} className="p-4 sm:p-5 flex-1 flex flex-col items-center justify-center min-h-[140px] text-center select-none cursor-pointer">
				{block.type === 'emoji' && (
					<div className="text-6xl sm:text-7xl py-2 drop-shadow-sm transition-transform group-hover:scale-105">
						{block.content || '😀'}
					</div>
				)}

				{block.type === 'letter' && (
					<div className="text-6xl sm:text-7xl font-black text-blue-600 tracking-tight py-2 drop-shadow-sm transition-transform group-hover:scale-105">
						{block.content || 'A'}
					</div>
				)}

				{block.type === 'number' && (
					<div className="text-6xl sm:text-7xl font-black text-purple-600 tracking-tight py-2 drop-shadow-sm transition-transform group-hover:scale-105">
						{block.content || '1'}
					</div>
				)}

				{block.type === 'script' && (
					<div className="w-full p-4 sm:p-5 rounded-xl bg-brand/5 border border-brand/20 text-brand flex flex-col justify-center">
						<h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-left break-words leading-snug">
							{block.content || formattedContent}
						</h3>
					</div>
				)}

				{block.type === 'activity' && (
					<div className="w-full space-y-2">
						<h4 className="text-left text-lg sm:text-xl font-bold text-gray-800 truncate" data-name="column-title">
							{block.content || 'Activity'}
						</h4>
						<div
							className="relative aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 transition-colors overflow-hidden flex items-center justify-center"
							data-name="column-image-area"
						>
							<ActivityBlockImage
								imageStorageId={block.imageStorageId}
								imageUrl={block.imageUrl}
								alt={block.content || 'Activity'}
							/>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

