'use client'

import React, { useState, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import posthog from 'posthog-js'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Canvas, CanvasBlock, CanvasPageContentProps, ActivityItem } from './types'
import { CanvasCarousel } from './canvas-carousel'
import { CanvasEditor } from './canvas-editor'

export function CanvasPageContent({ passphrase }: CanvasPageContentProps) {
	const activePassphrase = passphrase || ''
	const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null)
	const [isEditing, setIsEditing] = useState<boolean>(true)
	const [isWorkspaceEditingMode, setIsWorkspaceEditingMode] = useState<boolean>(false)

	const selectedCanvasIdRef = useRef<string | null>(selectedCanvasId)
	selectedCanvasIdRef.current = selectedCanvasId

	const learner = useQuery(
		api.learners.getByPassphrase,
		activePassphrase ? { passphrase: activePassphrase } : 'skip',
	)

	const canvasesRaw = useQuery(
		api.canvases.getByPassphrase,
		activePassphrase ? { passphrase: activePassphrase } : 'skip',
	)

	const scripts =
		useQuery(
			api.scripts.list,
			learner?._id ? { learnerId: learner._id } : 'skip',
		) || []

	const boards =
		useQuery(
			api.boards.getBoards,
			learner?._id ? { learnerId: learner._id } : 'skip',
		) || []

	const createCanvas = useMutation(api.canvases.create)
	const updateCanvas = useMutation(api.canvases.update)
	const removeCanvas = useMutation(api.canvases.remove)

	const activeBoardColumns: ActivityItem[] = (boards || []).flatMap(board =>
		board.columns.map(col => ({
			id: `${board._id}-${col.id}`,
			title: col.title,
			imageStorageId: col.imageStorageId,
			imagePrompt: col.imagePrompt,
		})),
	)

	const canvases: Canvas[] = (canvasesRaw as Canvas[]) || []

	const selectedCanvas: Canvas | null = selectedCanvasId
		? canvases.find(c => String(c._id) === String(selectedCanvasId)) || {
				_id: selectedCanvasId as Id<'canvases'>,
				learnerId: (learner?._id || '') as Id<'learners'>,
				name: `Canvas ${(canvases.length || 0) + 1}`,
				blocks: [],
				createdAt: Date.now(),
		  }
		: canvases.length > 0
			? canvases[0]
			: null

	// Prevent flash of empty "no canvases" state while Convex query is loading
	if (canvasesRaw === undefined || (activePassphrase && learner === undefined)) {
		return (
			<div className="container mx-auto max-w-4xl p-6 text-center py-16">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto mb-3" />
				<p className="text-sm font-medium text-gray-500">Loading canvases...</p>
			</div>
		)
	}

	const handleCreateNew = async () => {
		setIsEditing(true)
		setIsWorkspaceEditingMode(true)
		try {
			const newName = `Canvas ${(canvases.length || 0) + 1}`
			const newId = await createCanvas({
				passphrase: activePassphrase,
				name: newName,
				blocks: [],
			})
			if (newId) {
				const targetId = String(newId)
				selectedCanvasIdRef.current = targetId
				setSelectedCanvasId(targetId)
				captureEvent('canvas_created', { name: newName, blockCount: 0 })
			}
		} catch (err) {
			console.error('Failed to create new canvas:', err)
			selectedCanvasIdRef.current = null
			setSelectedCanvasId(null)
		}
	}

	const handleSelectCanvas = (canvas: Canvas) => {
		const targetId = canvas._id ? String(canvas._id) : null
		selectedCanvasIdRef.current = targetId
		setSelectedCanvasId(targetId)
		setIsEditing(true)
		setIsWorkspaceEditingMode(false)
	}

	const handleCloseEditor = () => {
		setIsEditing(false)
		selectedCanvasIdRef.current = null
		setSelectedCanvasId(null)
	}

	const captureEvent = (eventName: string, properties?: Record<string, any>) => {
		if (typeof window !== 'undefined' && (window as any).posthog?.capture) {
			;(window as any).posthog.capture(eventName, properties)
		}
		try {
			posthog.capture(eventName, properties)
		} catch {
			// ignore posthog init errors in test environment
		}
	}

	const safeNum = (val: any, fallback = 0): number => {
		const num = Number(val)
		return Number.isFinite(num) ? num : fallback
	}

	const sanitizeBlocks = (rawBlocks: CanvasBlock[]): CanvasBlock[] => {
		return rawBlocks.map(b => {
			const cleaned: Record<string, any> = {
				id: String(b.id || `block-${Date.now()}`),
				type: String(b.type || 'emoji'),
				content: String(b.content || ''),
				x: safeNum(b.x, 20),
				y: safeNum(b.y, 20),
			}
			if (b.width !== undefined && b.width !== null) cleaned.width = safeNum(b.width, 160)
			if (b.height !== undefined && b.height !== null) cleaned.height = safeNum(b.height, 80)
			if (b.color !== undefined && b.color !== null) cleaned.color = String(b.color)
			if (b.isTransparent !== undefined && b.isTransparent !== null) cleaned.isTransparent = Boolean(b.isTransparent)
			if (b.sourceId !== undefined && b.sourceId !== null) cleaned.sourceId = String(b.sourceId)
			if (b.imageStorageId !== undefined && b.imageStorageId !== null) cleaned.imageStorageId = String(b.imageStorageId)
			if (b.imageUrl !== undefined && b.imageUrl !== null) cleaned.imageUrl = String(b.imageUrl)
			if (b.strokeWidth !== undefined && b.strokeWidth !== null) cleaned.strokeWidth = safeNum(b.strokeWidth, 4)
			if (b.strokeColor !== undefined && b.strokeColor !== null) cleaned.strokeColor = String(b.strokeColor)
			if (Array.isArray(b.points)) {
				cleaned.points = b.points.map(p => ({
					x: safeNum(p.x, 0),
					y: safeNum(p.y, 0),
				}))
			}
			return cleaned as CanvasBlock
		})
	}

	const handleAutoSave = async (name: string, blocks: CanvasBlock[]) => {
		try {
			const cleanBlocks = sanitizeBlocks(blocks)
			captureEvent('canvas_autosaved', { name, blockCount: cleanBlocks.length })

			const currentId = selectedCanvasIdRef.current
			if (currentId && currentId !== '') {
				await updateCanvas({
					id: currentId as Id<'canvases'>,
					passphrase: activePassphrase,
					name,
					blocks: cleanBlocks,
				})
			} else {
				const newId = await createCanvas({
					passphrase: activePassphrase,
					name,
					blocks: cleanBlocks,
				})
				if (newId) {
					selectedCanvasIdRef.current = newId.toString()
					setSelectedCanvasId(newId.toString())
				}
			}
		} catch (error) {
			console.error('Failed to auto-save canvas:', error)
		}
	}

	const handleSave = async (name: string, blocks: CanvasBlock[]) => {
		try {
			const cleanBlocks = sanitizeBlocks(blocks)
			captureEvent('canvas_created', { name, blockCount: cleanBlocks.length })

			const currentId = selectedCanvasIdRef.current
			if (currentId && currentId !== '') {
				await updateCanvas({
					id: currentId as Id<'canvases'>,
					passphrase: activePassphrase,
					name,
					blocks: cleanBlocks,
				})
			} else {
				const newId = await createCanvas({
					passphrase: activePassphrase,
					name,
					blocks: cleanBlocks,
				})
				if (newId) {
					selectedCanvasIdRef.current = newId.toString()
					setSelectedCanvasId(newId.toString())
				}
			}
		} catch (error) {
			console.error('Failed to save canvas:', error)
			throw error
		}
	}

	const handleDelete = async (id: string) => {
		try {
			const targetId = id || selectedCanvas?._id?.toString()
			if (targetId) {
				captureEvent('canvas_deleted', { canvasId: targetId })
				await removeCanvas({
					id: targetId as Id<'canvases'>,
					passphrase: activePassphrase,
				})
			}
		} catch (error) {
			console.error('Failed to delete canvas:', error)
		} finally {
			setSelectedCanvasId(null)
			setIsEditing(true)
			setIsWorkspaceEditingMode(false)
		}
	}

	return (
		<div className="container mx-auto max-w-4xl p-4 sm:p-6 space-y-6">

			{/* Top Carousel Section */}
			<div>
				<CanvasCarousel
					canvases={canvases}
					activeCanvasId={selectedCanvas?._id}
					selectedCanvasId={selectedCanvas?._id}
					onSelectCanvas={handleSelectCanvas}
					onCreateNew={handleCreateNew}
					onDeleteCanvas={handleDelete}
				/>
			</div>

			{/* Persistent Canvas Workspace Section */}
			{isEditing && (
				<div>
					<CanvasEditor
						key="canvas-editor-main"
						canvas={selectedCanvas}
						passphrase={activePassphrase}
						isEditingMode={isWorkspaceEditingMode}
						onToggleEditMode={() => setIsWorkspaceEditingMode(prev => !prev)}
						onSave={handleSave}
						onAutoSave={handleAutoSave}
						onDelete={handleDelete}
						onClose={handleCloseEditor}
						scripts={scripts}
						activeBoardColumns={activeBoardColumns}
					/>
				</div>
			)}
		</div>
	)
}
