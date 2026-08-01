'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
	Plus,
	Trash2,
	Sparkles,
	AlertTriangle,
	FileText,
	Activity,
	Smile,
	Type,
	Hash,
	Paintbrush,
} from 'lucide-react'
import type {
	Canvas,
	CanvasBlock,
	CanvasBlockType,
	CanvasBlockItemProps,
	CanvasCardProps,
	CanvasCarouselProps,
	CanvasDeleteConfirmationModalProps,
	CanvasEditorProps,
	CanvasEmptyStateProps,
	CanvasExamplePreviewProps,
} from '@/lib/types/canvas'

const DEFAULT_PREVIEW_BLOCKS: CanvasBlock[] = [
	{ id: 'ex-1', type: 'emoji', content: '🎨', phrase: 'Paint' },
	{ id: 'ex-2', type: 'letter', content: 'A', phrase: 'Letter A' },
	{ id: 'ex-3', type: 'number', content: '1', phrase: 'Number 1' },
	{ id: 'ex-4', type: 'activity', content: '🎵', phrase: 'Music time' },
]

export function CanvasEmptyState({
	onCreateCanvas,
	className = '',
}: CanvasEmptyStateProps) {
	return (
		<div
			data-name="canvas-empty-state"
			className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border-2 border-dashed border-purple-200 shadow-sm ${className}`}
		>
			<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
				<Sparkles className="w-8 h-8" />
			</div>
			<h2 className="text-2xl font-bold text-gray-800 mb-2">No Canvases Yet</h2>
			<p className="text-gray-600 max-w-md mb-6">
				Create a canvas to express yourself with interactive sound blocks, scripts, letters, numbers, and colors!
			</p>

			<div className="w-full max-w-md mb-6">
				<CanvasExamplePreview />
			</div>

			<button
				data-name="create-canvas-button"
				onClick={onCreateCanvas}
				className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-md hover:bg-purple-700 transition flex items-center gap-2"
			>
				<Plus className="w-5 h-5" />
				Create New Canvas
			</button>
		</div>
	)
}

export function CanvasExamplePreview({
	blocks = DEFAULT_PREVIEW_BLOCKS,
	className = '',
}: CanvasExamplePreviewProps) {
	return (
		<div
			data-name="canvas-example-preview"
			className={`p-4 bg-purple-50/60 rounded-xl border border-purple-100 ${className}`}
		>
			<span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block mb-3 text-left">
				Example Canvas Preview
			</span>
			<div className="flex flex-wrap gap-3 justify-center">
				{blocks.map((block) => (
					<div
						key={block.id}
						className="px-4 py-3 bg-white rounded-xl shadow-sm border border-purple-100 flex items-center gap-2"
					>
						<span className="text-2xl">{block.content}</span>
						{block.phrase && (
							<span className="text-xs font-medium text-gray-600">{block.phrase}</span>
						)}
					</div>
				))}
			</div>
		</div>
	)
}

export function CanvasCarousel({
	canvases,
	onSelectCanvas,
	selectedCanvasId,
	className = '',
}: CanvasCarouselProps) {
	return (
		<div
			data-name="canvas-carousel"
			className={`flex gap-4 overflow-x-auto pb-4 pt-2 px-1 scrollbar-thin ${className}`}
		>
			{canvases.map((canvas) => (
				<CanvasCard
					key={canvas.id}
					canvas={canvas}
					isSelected={canvas.id === selectedCanvasId}
					onClick={() => onSelectCanvas(canvas)}
				/>
			))}
		</div>
	)
}

export function CanvasCard({
	canvas,
	onClick,
	isSelected,
	className = '',
}: CanvasCardProps) {
	return (
		<div
			data-name="canvas-card"
			onClick={onClick}
			className={`min-w-[200px] max-w-[240px] p-4 rounded-xl cursor-pointer transition-all border ${
				isSelected
					? 'bg-purple-50 border-purple-600 shadow-md ring-2 ring-purple-600/20'
					: 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm'
			} ${className}`}
		>
			<h3 className="font-bold text-gray-900 truncate mb-1">
				{canvas.title || 'Untitled Canvas'}
			</h3>
			<p className="text-xs text-gray-500 mb-3">
				{canvas.blocks.length} {canvas.blocks.length === 1 ? 'block' : 'blocks'}
			</p>
			<div className="flex gap-1 overflow-hidden">
				{canvas.blocks.slice(0, 4).map((b, i) => (
					<span
						key={b.id || i}
						className="text-sm px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200"
					>
						{b.content || b.type}
					</span>
				))}
				{canvas.blocks.length > 4 && (
					<span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
						+{canvas.blocks.length - 4}
					</span>
				)}
			</div>
		</div>
	)
}

export function CanvasBlockItem({
	block,
	onTap,
	isAnimating = false,
	className = '',
}: CanvasBlockItemProps) {
	const [tappedAnimation, setTappedAnimation] = useState(false)

	const handleTap = () => {
		setTappedAnimation(true)
		setTimeout(() => setTappedAnimation(false), 600)

		// Trigger PostHog event
		if (typeof window !== 'undefined' && window.posthog) {
			window.posthog.capture('canvas_block_tapped', {
				blockType: block.type,
				content: block.content,
			})
		}

		// Trigger speech synthesis
		if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
			const textToSpeak = block.phrase || block.label || block.content
			if (textToSpeak) {
				const utterance = new SpeechSynthesisUtterance(textToSpeak)
				window.speechSynthesis.speak(utterance)
			}
		}

		onTap?.(block)
	}

	const showBounce = isAnimating || tappedAnimation

	return (
		<div
			data-name={`canvas-block-${block.type}`}
			onClick={handleTap}
			className={`p-4 rounded-xl bg-white border-2 border-purple-100 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col items-center justify-center min-w-[100px] min-h-[100px] select-none ${
				showBounce ? 'animate-seed-bounce border-purple-400 ring-2 ring-purple-300' : ''
			} ${className}`}
		>
			<span className="text-3xl mb-1">{block.content}</span>
			{block.label && (
				<span className="text-xs font-semibold text-gray-700">{block.label}</span>
			)}
			{block.phrase && (
				<span className="text-[10px] text-gray-500 mt-0.5">{block.phrase}</span>
			)}
		</div>
	)
}

export function CanvasDeleteConfirmationModal({
	isOpen,
	onConfirm,
	onCancel,
}: CanvasDeleteConfirmationModalProps) {
	const [dismissed, setDismissed] = useState(false)

	useEffect(() => {
		if (isOpen) {
			setDismissed(false)
		}
	}, [isOpen])

	if (!isOpen || dismissed) return null

	const handleConfirm = () => {
		setDismissed(true)
		onConfirm()
	}

	const handleCancel = () => {
		setDismissed(true)
		onCancel()
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
				<div className="flex items-center gap-3 mb-4 text-red-600">
					<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
						<AlertTriangle className="w-5 h-5" />
					</div>
					<h3 className="text-xl font-bold text-gray-900">Delete Canvas?</h3>
				</div>
				<p className="text-gray-600 mb-6">
					Are you sure you want to delete this canvas? This action cannot be undone.
				</p>
				<div className="flex justify-end gap-3">
					<button
						data-name="cancel-delete-canvas-button"
						onClick={handleCancel}
						className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
					>
						Cancel
					</button>
					<button
						data-name="confirm-delete-canvas-button"
						onClick={handleConfirm}
						className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg shadow-sm transition"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	)
}

const DEFAULT_BLOCK_TEMPLATES: Record<
	CanvasBlockType,
	{ content: string; label: string; phrase?: string; seed?: string }
> = {
	script: { content: '📜', label: 'Script Block', phrase: 'Reading script', seed: 'script-seed' },
	activity: { content: '🎯', label: 'Activity Block', phrase: 'Doing activity', seed: 'activity-seed' },
	emoji: { content: '⭐', label: 'Star', phrase: 'Shining star', seed: 'emoji-seed' },
	letter: { content: 'A', label: 'Letter A', phrase: 'Letter A', seed: 'letter-seed' },
	number: { content: '1', label: 'Number 1', phrase: 'Number 1', seed: 'number-seed' },
	paint: { content: '🎨', label: 'Paint Block', phrase: 'Painting colors', seed: 'paint-seed' },
}

const BLOCK_TYPE_CONFIG: { type: CanvasBlockType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
	{ type: 'script', label: 'Script', icon: FileText },
	{ type: 'activity', label: 'Activity', icon: Activity },
	{ type: 'emoji', label: 'Emoji', icon: Smile },
	{ type: 'letter', label: 'Letter', icon: Type },
	{ type: 'number', label: 'Number', icon: Hash },
	{ type: 'paint', label: 'Paint', icon: Paintbrush },
]

export function CanvasEditor({
	canvas,
	onSave,
	onDelete,
	onBlockTap,
	className = '',
}: CanvasEditorProps) {
	const titleInputRef = useRef<HTMLInputElement>(null)
	const [blocks, setBlocks] = useState<CanvasBlock[]>(canvas?.blocks || [])
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

	useEffect(() => {
		if (canvas && titleInputRef.current) {
			titleInputRef.current.value = canvas.title || ''
			setBlocks(canvas.blocks || [])
		}
	}, [canvas])

	const addBlock = (type: CanvasBlockType) => {
		const template = DEFAULT_BLOCK_TEMPLATES[type]
		const newBlock: CanvasBlock = {
			id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
			type,
			content: template.content,
			label: template.label,
			phrase: template.phrase,
			seed: template.seed,
		}
		setBlocks((prev) => [...prev, newBlock])
	}

	const handleSave = () => {
		const finalTitle = titleInputRef.current?.value || ''

		onSave({ title: finalTitle, blocks })

		if (typeof window !== 'undefined' && window.posthog) {
			window.posthog.capture('canvas_created', {
				title: finalTitle,
				blockTypes: blocks.map((b) => b.type),
			})
		}
	}

	const handleConfirmDelete = () => {
		if (canvas?.id && onDelete) {
			onDelete(canvas.id)
			if (typeof window !== 'undefined' && window.posthog) {
				window.posthog.capture('canvas_deleted', {
					canvasId: canvas.id,
				})
			}
		}
		setIsDeleteModalOpen(false)
	}

	return (
		<div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm ${className}`}>
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
				<input
					ref={titleInputRef}
					data-name="canvas-title-input"
					type="text"
					defaultValue={canvas?.title || ''}
					placeholder="Canvas Title (e.g., My Creative Space)"
					className="w-full sm:w-80 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold text-lg"
				/>

				<div className="flex items-center gap-2">
					{(canvas || onDelete) && (
						<button
							data-name="delete-canvas-button"
							onClick={() => setIsDeleteModalOpen(true)}
							className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 font-medium rounded-xl transition flex items-center gap-2"
						>
							<Trash2 className="w-4 h-4" />
							Delete
						</button>
					)}
					<button
						data-name="save-canvas-button"
						onClick={handleSave}
						className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow transition"
					>
						Save Canvas
					</button>
				</div>
			</div>

			<div className="mb-6">
				<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
					Add Blocks
				</label>
				<div className="flex flex-wrap gap-2">
					{BLOCK_TYPE_CONFIG.map(({ type, label, icon: Icon }) => (
						<button
							key={type}
							data-name={`add-block-${type}`}
							onClick={() => addBlock(type)}
							className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium rounded-lg border border-purple-200 flex items-center gap-1.5 transition"
						>
							<Icon className="w-4 h-4" />
							+ {label}
						</button>
					))}
				</div>
			</div>

			<div>
				<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
					Canvas Workspace
				</label>
				{blocks.length === 0 ? (
					<div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
						No blocks added yet. Click an add-block button above to populate your canvas!
					</div>
				) : (
					<div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 min-h-[160px]">
						{blocks.map((block) => (
							<CanvasBlockItem
								key={block.id}
								block={block}
								onTap={onBlockTap}
							/>
						))}
					</div>
				)}
			</div>

			<CanvasDeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onConfirm={handleConfirmDelete}
				onCancel={() => setIsDeleteModalOpen(false)}
			/>
		</div>
	)
}
