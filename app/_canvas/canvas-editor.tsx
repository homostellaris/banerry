'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
	CanvasEditorProps,
	CanvasBlock,
	ScriptItem,
	ActivityItem,
	CANVAS_DATA_NAMES,
} from './types'
import { CanvasBlockItem } from './canvas-block-item'
import { BlockPalette } from './block-palette'
import { ScriptPickerModal } from './script-picker-modal'
import { ActivityPickerModal } from './activity-picker-modal'
import { EmojiPickerModal } from './emoji-picker-modal'
import { LetterPickerModal } from './letter-picker-modal'
import { NumberPickerModal } from './number-picker-modal'

import { Pencil, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

function getGridClasses(blockCount: number): string {
	if (blockCount <= 1) return 'grid-cols-1 max-w-sm mx-auto'
	if (blockCount === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
	if (blockCount === 3) return 'grid-cols-1 md:grid-cols-3'
	if (blockCount === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
	if (blockCount === 5) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
	return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
}

export function CanvasEditor({
	canvas,
	passphrase,
	onSave,
	onAutoSave,
	onDelete,
	onClose: _onClose,
	scripts = [],
	activeBoardColumns = [],
	autoSaveDelayMs = 300,
	isAutoSaving = false,
	isEditingMode: isEditingModeProp,
	onToggleEditMode,
	readOnly = false,
}: CanvasEditorProps) {
	const [name, setName] = useState(canvas?.name || 'My New Canvas')
	const [blocks, setBlocks] = useState<CanvasBlock[]>(() => {
		if (!canvas?.blocks) return []
		return canvas.blocks
	})

	const [internalEditMode, setInternalEditMode] = useState<boolean>(isEditingModeProp ?? true)
	const isEditing = (isEditingModeProp !== undefined ? isEditingModeProp : internalEditMode) && !readOnly

	const handleSave = () => {
		onSave?.(name, blocks)
	}

	const handleToggleMode = () => {
		if (isEditing) {
			handleSave()
		}
		if (onToggleEditMode) {
			onToggleEditMode()
		} else {
			setInternalEditMode(prev => !prev)
		}
	}

	const [internalSaving, setInternalSaving] = useState(false)
	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	// Picker modal states
	const [isScriptPickerOpen, setIsScriptPickerOpen] = useState(false)
	const [isActivityPickerOpen, setIsActivityPickerOpen] = useState(false)
	const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
	const [isLetterPickerOpen, setIsLetterPickerOpen] = useState(false)
	const [isNumberPickerOpen, setIsNumberPickerOpen] = useState(false)
	const [targetBlockId, setTargetBlockId] = useState<string | null>(null)

	const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const isUserDirtyRef = useRef(false)
	const isSwitchingCanvasRef = useRef(false)
	const lastSavedSnapshotRef = useRef<string>(
		JSON.stringify({ name: canvas?.name || 'My New Canvas', blocks: canvas?.blocks || [] })
	)

	// Sync state only when switching between distinct canvas IDs
	const prevCanvasIdRef = useRef<string | undefined>(canvas?._id?.toString())
	const currentBlocksRef = useRef(blocks)
	currentBlocksRef.current = blocks
	const currentNameRef = useRef(name)
	currentNameRef.current = name

	useEffect(() => {
		const currentId = canvas?._id?.toString()
		if (currentId && prevCanvasIdRef.current && currentId !== prevCanvasIdRef.current) {
			if (autoSaveTimerRef.current && onAutoSave) {
				clearTimeout(autoSaveTimerRef.current)
				autoSaveTimerRef.current = null
			}
			setInternalSaving(false)
			isUserDirtyRef.current = false
			isSwitchingCanvasRef.current = true
			prevCanvasIdRef.current = currentId
			setShowDeleteConfirm(false)
			setSelectedBlockId(null)
			if (canvas) {
				setName(canvas.name)
				setBlocks(canvas.blocks || [])
				lastSavedSnapshotRef.current = JSON.stringify({ name: canvas.name, blocks: canvas.blocks || [] })
			}
			setTimeout(() => {
				isSwitchingCanvasRef.current = false
			}, 50)
		} else if (currentId && !prevCanvasIdRef.current) {
			prevCanvasIdRef.current = currentId
			setInternalSaving(false)
			setShowDeleteConfirm(false)
			setSelectedBlockId(null)
			if (canvas) {
				if (currentBlocksRef.current.length === 0) {
					setName(canvas.name)
					setBlocks(canvas.blocks || [])
					lastSavedSnapshotRef.current = JSON.stringify({ name: canvas.name, blocks: canvas.blocks || [] })
					isUserDirtyRef.current = false
				} else {
					isUserDirtyRef.current = true
				}
			}
		}
	}, [canvas, onAutoSave])

	// Debounced auto-save effect
	useEffect(() => {
		if (isSwitchingCanvasRef.current) {
			return
		}
		const currentSnapshot = JSON.stringify({ name, blocks })
		if (currentSnapshot === lastSavedSnapshotRef.current || !isUserDirtyRef.current) {
			return
		}

		if (!onAutoSave) return

		setInternalSaving(true)
		if (autoSaveTimerRef.current) {
			clearTimeout(autoSaveTimerRef.current)
		}

		autoSaveTimerRef.current = setTimeout(async () => {
			const latestName = currentNameRef.current
			const latestBlocks = currentBlocksRef.current
			lastSavedSnapshotRef.current = JSON.stringify({ name: latestName, blocks: latestBlocks })
			isUserDirtyRef.current = false
			try {
				await Promise.resolve(onAutoSave(latestName, latestBlocks))
			} finally {
				setInternalSaving(false)
				autoSaveTimerRef.current = null
			}
		}, autoSaveDelayMs)

		return () => {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current)
			}
		}
	}, [name, blocks, onAutoSave, autoSaveDelayMs])

	const isSaving = isAutoSaving || internalSaving

	const handleDeleteBlock = (id: string) => {
		isUserDirtyRef.current = true
		setBlocks(prev => prev.filter(b => b.id !== id))
		if (selectedBlockId === id) {
			setSelectedBlockId(null)
		}
	}

	const handleMoveLeft = (id: string) => {
		isUserDirtyRef.current = true
		setBlocks(prev => {
			const index = prev.findIndex(b => b.id === id)
			if (index <= 0) return prev
			const newBlocks = [...prev]
			const temp = newBlocks[index - 1]
			newBlocks[index - 1] = newBlocks[index]
			newBlocks[index] = temp
			return newBlocks
		})
	}

	const handleMoveRight = (id: string) => {
		isUserDirtyRef.current = true
		setBlocks(prev => {
			const index = prev.findIndex(b => b.id === id)
			if (index < 0 || index >= prev.length - 1) return prev
			const newBlocks = [...prev]
			const temp = newBlocks[index + 1]
			newBlocks[index + 1] = newBlocks[index]
			newBlocks[index] = temp
			return newBlocks
		})
	}

	const handleAddBlock = (type: CanvasBlock['type'], content?: string) => {
		isUserDirtyRef.current = true
		const defaultBlockContent =
			content ||
			(type === 'emoji'
				? '😀'
				: type === 'letter'
				? 'A'
				: type === 'number'
				? '1'
				: type === 'script'
				? scripts.length > 0 ? scripts[0].dialogue : 'Hello'
				: activeBoardColumns.length > 0 ? activeBoardColumns[0].title : 'Brush Teeth')

		const newBlock: CanvasBlock = {
			id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
			type,
			content: defaultBlockContent,
			x: 0,
			y: 0,
			imageStorageId:
				type === 'activity' && activeBoardColumns.length > 0
					? activeBoardColumns[0].imageStorageId
					: undefined,
			imageUrl:
				type === 'activity' && activeBoardColumns.length > 0
					? activeBoardColumns[0].imageUrl
					: undefined,
		}

		setBlocks(prev => [...prev, newBlock])
		setSelectedBlockId(newBlock.id)
		setTargetBlockId(newBlock.id)

		if (type === 'script') {
			setIsScriptPickerOpen(true)
		} else if (type === 'activity') {
			setIsActivityPickerOpen(true)
		} else if (type === 'emoji') {
			setIsEmojiPickerOpen(true)
		} else if (type === 'letter') {
			setIsLetterPickerOpen(true)
		} else if (type === 'number') {
			setIsNumberPickerOpen(true)
		}
	}

	const handleChangeScriptOrActivity = (block: CanvasBlock) => {
		setTargetBlockId(block.id)
		if (block.type === 'script') {
			setIsScriptPickerOpen(true)
		} else if (block.type === 'activity') {
			setIsActivityPickerOpen(true)
		} else if (block.type === 'emoji') {
			setIsEmojiPickerOpen(true)
		} else if (block.type === 'letter') {
			setIsLetterPickerOpen(true)
		} else if (block.type === 'number') {
			setIsNumberPickerOpen(true)
		}
	}

	const handleSelectScript = (script: ScriptItem) => {
		if (!targetBlockId) return
		isUserDirtyRef.current = true
		setBlocks(prev =>
			prev.map(b =>
				b.id === targetBlockId
					? { ...b, content: script.dialogue, sourceId: script._id }
					: b
			)
		)
		setIsScriptPickerOpen(false)
		setTargetBlockId(null)
	}

	const handleSelectActivity = (activity: ActivityItem) => {
		if (!targetBlockId) return
		isUserDirtyRef.current = true
		setBlocks(prev =>
			prev.map(b =>
				b.id === targetBlockId
					? {
							...b,
							content: activity.title,
							sourceId: activity.id,
							imageStorageId: activity.imageStorageId,
							imageUrl: activity.imageUrl,
						}
					: b
			)
		)
		setIsActivityPickerOpen(false)
		setTargetBlockId(null)
	}

	const handleSelectEmoji = (emoji: string) => {
		if (!targetBlockId) return
		isUserDirtyRef.current = true
		setBlocks(prev => prev.map(b => (b.id === targetBlockId ? { ...b, content: emoji } : b)))
		setIsEmojiPickerOpen(false)
		setTargetBlockId(null)
	}

	const handleSelectLetter = (letter: string) => {
		if (!targetBlockId) return
		isUserDirtyRef.current = true
		setBlocks(prev => prev.map(b => (b.id === targetBlockId ? { ...b, content: letter } : b)))
		setIsLetterPickerOpen(false)
		setTargetBlockId(null)
	}

	const handleSelectNumber = (num: string) => {
		if (!targetBlockId) return
		isUserDirtyRef.current = true
		setBlocks(prev => prev.map(b => (b.id === targetBlockId ? { ...b, content: num } : b)))
		setIsNumberPickerOpen(false)
		setTargetBlockId(null)
	}

	const handleDelete = () => {
		setShowDeleteConfirm(false)
		const idToDelete = canvas?._id ? canvas._id.toString() : ''
		onDelete?.(idToDelete)
	}

	return (
		<div
			data-name={CANVAS_DATA_NAMES.EDITOR}
			className="space-y-6 w-full max-w-full"
		>
			<div
				data-name={isEditing ? CANVAS_DATA_NAMES.EDIT_MODE_VIEW : CANVAS_DATA_NAMES.READ_MODE_VIEW}
				className="space-y-6 w-full"
			>
				{/* Canvas Name Display / Edit Bar outside above cards (matching Boards page) */}
				<div className="text-center">
					{/* Canvas Title: exact same component in both Read and Edit mode, unaffected by Edit button */}
					<h2
						data-name={CANVAS_DATA_NAMES.CANVAS_TITLE}
						className="text-3xl sm:text-4xl font-bold text-brand text-center px-4 max-w-2xl mx-auto break-words select-none"
					>
						{name || 'Untitled Canvas'}
					</h2>

					{/* Controls Toolbar: centered Edit/Done button with zero layout shift */}
					{!readOnly && (
						<div className="relative flex items-center justify-center min-h-[36px] w-full max-w-xl mx-auto px-4 mt-3">
							{/* Left Flank: Auto-Save Indicator (Edit Mode only) */}
							{isEditing && (
								<div
									data-name={CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR}
									className="absolute left-4 flex items-center space-x-1.5 text-xs text-brand bg-brand/10 px-2.5 py-1 rounded-full border border-brand/20 font-medium shrink-0"
								>
									<span
										className={`w-2 h-2 rounded-full ${
											isSaving ? 'bg-brand animate-ping' : 'bg-brand'
										}`}
									/>
									<span>{isSaving ? 'Saving...' : 'Saved'}</span>
								</div>
							)}

							{/* Center: Toggle Edit / Done Button - locked to exact center */}
							<Button
								data-name={CANVAS_DATA_NAMES.TOGGLE_EDIT_MODE_BTN}
								onClick={handleToggleMode}
								variant="outline"
								size="sm"
								className="gap-1.5 min-w-[84px] justify-center shrink-0"
							>
								{isEditing ? (
									<>
										<Check className="h-4 w-4 text-brand" /> Done
									</>
								) : (
									<>
										<Pencil className="h-4 w-4 text-brand" /> Edit
									</>
								)}
							</Button>

							{/* Right Flank: Delete Button (Edit Mode only) */}
							{isEditing && (canvas?._id || onDelete) && (
								<Button
									type="button"
									data-name={CANVAS_DATA_NAMES.DELETE_BTN}
									onClick={() => setShowDeleteConfirm(true)}
									variant="ghost"
									size="sm"
									className="absolute right-4 text-rose-600 hover:text-rose-700 hover:bg-rose-50 shrink-0"
								>
									<Trash2 className="h-4 w-4 mr-1" /> Delete
								</Button>
							)}
						</div>
					)}
				</div>

				{/* Delete Confirmation Alert */}
				{showDeleteConfirm && isEditing && (
					<div className="p-3 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-wrap items-center justify-between gap-2 max-w-xl mx-auto">
						<span className="text-xs sm:text-sm font-medium text-rose-800">
							Are you sure you want to delete this canvas?
						</span>
						<div className="flex items-center space-x-2 shrink-0">
							<button
								type="button"
								data-name={CANVAS_DATA_NAMES.DELETE_CONFIRM_BTN}
								onClick={handleDelete}
								className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-md shadow"
							>
								Confirm Delete
							</button>
							<button
								type="button"
								onClick={() => setShowDeleteConfirm(false)}
								className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-md"
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				{/* Block Palette Container (Only in Edit Mode) */}
				{isEditing && (
					<BlockPalette
						onSelectBlockType={handleAddBlock}
						scripts={scripts}
						activeBoardColumns={activeBoardColumns}
					/>
				)}

				{/* Canvas Workspace - Linear Flow matching Board Structure */}
				<div data-name="canvas-grid" className="w-full">
					{blocks.length > 0 ? (
						<div className={`grid gap-4 ${getGridClasses(blocks.length)}`}>
							{blocks.map((block, idx) => (
								<CanvasBlockItem
									key={block.id}
									block={block}
									index={idx}
									totalBlocks={blocks.length}
									isSelected={selectedBlockId === block.id}
									isEditingMode={isEditing}
									readOnly={readOnly}
									onTap={b => setSelectedBlockId(b.id)}
									onDelete={handleDeleteBlock}
									onMoveLeft={handleMoveLeft}
									onMoveRight={handleMoveRight}
									onChangeScriptOrActivity={handleChangeScriptOrActivity}
								/>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white/60 max-w-md mx-auto">
							<span className="text-5xl mb-3">🧩</span>
							<p className="text-base font-bold text-gray-700 mb-1">Canvas is empty</p>
							<p className="text-xs text-gray-500 max-w-xs">
								{isEditing
									? 'Add scripts, activities, emojis, letters, or numbers from the palette above to build your sequence.'
									: 'This canvas has no blocks yet. Click Edit to add some!'}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Hidden Passphrase container */}
			<div className="hidden">{passphrase}</div>

			{/* Script Picker Modal */}
			<ScriptPickerModal
				isOpen={isScriptPickerOpen}
				scripts={scripts}
				selectedScriptId={
					blocks.find(b => b.id === targetBlockId)?.sourceId
				}
				onSelectScript={handleSelectScript}
				onClose={() => {
					setIsScriptPickerOpen(false)
					setTargetBlockId(null)
				}}
			/>

			{/* Activity Picker Modal */}
			<ActivityPickerModal
				isOpen={isActivityPickerOpen}
				activities={activeBoardColumns}
				selectedActivityId={
					blocks.find(b => b.id === targetBlockId)?.sourceId
				}
				onSelectActivity={handleSelectActivity}
				onClose={() => {
					setIsActivityPickerOpen(false)
					setTargetBlockId(null)
				}}
			/>

			{/* Emoji Picker Modal */}
			<EmojiPickerModal
				isOpen={isEmojiPickerOpen}
				selectedEmoji={blocks.find(b => b.id === targetBlockId)?.content}
				onSelectEmoji={handleSelectEmoji}
				onClose={() => {
					setIsEmojiPickerOpen(false)
					setTargetBlockId(null)
				}}
			/>

			{/* Letter Picker Modal */}
			<LetterPickerModal
				isOpen={isLetterPickerOpen}
				selectedLetter={blocks.find(b => b.id === targetBlockId)?.content}
				onSelectLetter={handleSelectLetter}
				onClose={() => {
					setIsLetterPickerOpen(false)
					setTargetBlockId(null)
				}}
			/>

			{/* Number Picker Modal */}
			<NumberPickerModal
				isOpen={isNumberPickerOpen}
				selectedNumber={blocks.find(b => b.id === targetBlockId)?.content}
				onSelectNumber={handleSelectNumber}
				onClose={() => {
					setIsNumberPickerOpen(false)
					setTargetBlockId(null)
				}}
			/>
		</div>
	)
}
