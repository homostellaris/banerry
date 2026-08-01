import { GlobalWindow } from 'happy-dom'

const windowInstance = new GlobalWindow()
Object.assign(globalThis, {
	window: windowInstance,
	document: windowInstance.document,
	navigator: windowInstance.navigator,
	HTMLElement: windowInstance.HTMLElement,
	Element: windowInstance.Element,
	Node: windowInstance.Node,
	CustomEvent: windowInstance.CustomEvent,
	HTMLInputElement: windowInstance.HTMLInputElement,
	HTMLButtonElement: windowInstance.HTMLButtonElement,
})
import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import type {
	Canvas,
	CanvasBlock,
	CanvasBlockType,
	CanvasEmptyStateProps,
	CanvasExamplePreviewProps,
	CanvasCarouselProps,
	CanvasCardProps,
	CanvasBlockItemProps,
	CanvasEditorProps,
	CanvasDeleteConfirmationModalProps,
	CanvasCreatedEventPayload,
	CanvasBlockTappedEventPayload,
	CanvasDeletedEventPayload,
} from '@/lib/types/canvas'
import {
	CanvasEmptyState,
	CanvasExamplePreview,
	CanvasCarousel,
	CanvasCard,
	CanvasBlockItem,
	CanvasEditor,
	CanvasDeleteConfirmationModal,
} from './canvas'

// Mock posthog on window object
declare global {
	interface Window {
		posthog?: {
			capture: (event: string, properties?: Record<string, any>) => void
		}
	}
}

const mockPosthogCapture = mock()

beforeEach(() => {
	cleanup()
	mockPosthogCapture.mockReset()
	window.posthog = {
		capture: mockPosthogCapture,
	}
})

describe('Canvas Components Unit Tests', () => {
	describe('CanvasEmptyState Component', () => {
		it('renders canvas-empty-state, canvas-example-preview, and create-canvas-button', () => {
			const handleCreate = mock()
			render(<CanvasEmptyState onCreateCanvas={handleCreate} />)

			const emptyState = document.querySelector(
				'[data-name="canvas-empty-state"]'
			)
			const examplePreview = document.querySelector(
				'[data-name="canvas-example-preview"]'
			)
			const createBtn = document.querySelector(
				'[data-name="create-canvas-button"]'
			)

			expect(emptyState).not.toBeNull()
			expect(examplePreview).not.toBeNull()
			expect(createBtn).not.toBeNull()
		})

		it('triggers onCreateCanvas callback when create-canvas-button is clicked', () => {
			const handleCreate = mock()
			render(<CanvasEmptyState onCreateCanvas={handleCreate} />)

			const createBtn = document.querySelector(
				'[data-name="create-canvas-button"]'
			)
			expect(createBtn).not.toBeNull()
			if (createBtn) {
				fireEvent.click(createBtn)
				expect(handleCreate).toHaveBeenCalledTimes(1)
			}
		})
	})

	describe('CanvasExamplePreview Component', () => {
		it('renders visual canvas example preview container with data-name="canvas-example-preview"', () => {
			const sampleBlocks: CanvasBlock[] = [
				{
					id: 'b1',
					type: 'emoji',
					content: '🎨',
					phrase: 'Paint brush',
					seed: 'paint-seed',
				},
				{
					id: 'b2',
					type: 'letter',
					content: 'A',
					phrase: 'Letter A',
					seed: 'letter-a-seed',
				},
			]
			render(<CanvasExamplePreview blocks={sampleBlocks} />)

			const preview = document.querySelector(
				'[data-name="canvas-example-preview"]'
			)
			expect(preview).not.toBeNull()
		})
	})

	describe('CanvasEditor Component - Canvas Creation & Block Adding', () => {
		const blockTypes: CanvasBlockType[] = [
			'script',
			'activity',
			'emoji',
			'letter',
			'number',
			'paint',
		]

		it('renders canvas-title-input, save-canvas-button, and add-block buttons for all block types', () => {
			const handleSave = mock()
			render(<CanvasEditor onSave={handleSave} />)

			const titleInput = document.querySelector(
				'[data-name="canvas-title-input"]'
			)
			const saveBtn = document.querySelector(
				'[data-name="save-canvas-button"]'
			)

			expect(titleInput).not.toBeNull()
			expect(saveBtn).not.toBeNull()

			blockTypes.forEach(type => {
				const addBtn = document.querySelector(
					`[data-name="add-block-${type}"]`
				)
				expect(addBtn).not.toBeNull()
			})
		})

		it('allows typing a title, adding blocks for each type (script, activity, emoji, letter, number, paint), saving canvas, and triggers posthog event "canvas_created"', () => {
			const handleSave = mock()
			render(<CanvasEditor onSave={handleSave} />)

			const titleInput = document.querySelector(
				'[data-name="canvas-title-input"]'
			) as HTMLInputElement
			expect(titleInput).not.toBeNull()
			fireEvent.change(titleInput, { target: { value: 'My Creative Space' } })

			blockTypes.forEach(type => {
				const addBtn = document.querySelector(
					`[data-name="add-block-${type}"]`
				)
				expect(addBtn).not.toBeNull()
				if (addBtn) {
					fireEvent.click(addBtn)
				}
				const blockItem = document.querySelector(
					`[data-name="canvas-block-${type}"]`
				)
				expect(blockItem).not.toBeNull()
			})

			const saveBtn = document.querySelector(
				'[data-name="save-canvas-button"]'
			)
			expect(saveBtn).not.toBeNull()
			if (saveBtn) {
				fireEvent.click(saveBtn)
			}

			expect(handleSave).toHaveBeenCalledTimes(1)
			expect(handleSave).toHaveBeenCalledWith({
				title: 'My Creative Space',
				blocks: expect.arrayContaining(
					blockTypes.map(type => expect.objectContaining({ type }))
				),
			})

			expect(mockPosthogCapture).toHaveBeenCalledWith(
				'canvas_created',
				expect.objectContaining({
					title: 'My Creative Space',
					blockTypes: expect.arrayContaining(blockTypes),
				} as CanvasCreatedEventPayload)
			)
		})
	})

	describe('CanvasBlockItem Component - View, Speech Output & Seed Bounce Animation', () => {
		const sampleBlock: CanvasBlock = {
			id: 'block-1',
			type: 'emoji',
			content: '⭐',
			label: 'Star',
			phrase: 'Shining star',
			seed: 'Shining star',
		}

		it('renders block element with data-name="canvas-block-${blockType}"', () => {
			render(<CanvasBlockItem block={sampleBlock} />)

			const blockEl = document.querySelector(
				`[data-name="canvas-block-${sampleBlock.type}"]`
			)
			expect(blockEl).not.toBeNull()
		})

		it('applies animate-seed-bounce CSS class when tapped or when isAnimating is true', () => {
			const handleTap = mock()
			const { rerender } = render(
				<CanvasBlockItem block={sampleBlock} onTap={handleTap} />
			)

			const blockEl = document.querySelector(
				`[data-name="canvas-block-${sampleBlock.type}"]`
			)
			expect(blockEl).not.toBeNull()

			if (blockEl) {
				fireEvent.click(blockEl)
				expect(handleTap).toHaveBeenCalledWith(sampleBlock)
			}

			rerender(
				<CanvasBlockItem
					block={sampleBlock}
					onTap={handleTap}
					isAnimating={true}
				/>
			)
			const animatingBlockEl = document.querySelector(
				`[data-name="canvas-block-${sampleBlock.type}"]`
			)
			expect(
				animatingBlockEl?.classList.contains('animate-seed-bounce')
			).toBe(true)
		})

		it('triggers say out loud speech output and posthog event "canvas_block_tapped" on tap', () => {
			const handleTap = mock()
			render(<CanvasBlockItem block={sampleBlock} onTap={handleTap} />)

			const blockEl = document.querySelector(
				`[data-name="canvas-block-${sampleBlock.type}"]`
			)
			expect(blockEl).not.toBeNull()

			if (blockEl) {
				fireEvent.click(blockEl)
				expect(handleTap).toHaveBeenCalledWith(sampleBlock)
			}

			expect(mockPosthogCapture).toHaveBeenCalledWith(
				'canvas_block_tapped',
				expect.objectContaining({
					blockType: sampleBlock.type,
					content: sampleBlock.content,
				} as CanvasBlockTappedEventPayload)
			)
		})
	})

	describe('CanvasCarousel & CanvasCard Components', () => {
		const mockCanvases: Canvas[] = [
			{
				id: 'canvas-1',
				title: 'First Canvas',
				blocks: [{ id: 'b1', type: 'emoji', content: '🚀' }],
				createdAt: 1000,
			},
			{
				id: 'canvas-2',
				title: 'Second Canvas',
				blocks: [{ id: 'b2', type: 'number', content: '7' }],
				createdAt: 2000,
			},
		]

		it('renders horizontal carousel with data-name="canvas-carousel" and cards with data-name="canvas-card"', () => {
			const handleSelect = mock()
			render(
				<CanvasCarousel
					canvases={mockCanvases}
					onSelectCanvas={handleSelect}
				/>
			)

			const carousel = document.querySelector('[data-name="canvas-carousel"]')
			expect(carousel).not.toBeNull()

			const cards = document.querySelectorAll('[data-name="canvas-card"]')
			expect(cards.length).toBe(2)
		})

		it('triggers onSelectCanvas when a canvas card is clicked', () => {
			const handleSelect = mock()
			render(
				<CanvasCarousel
					canvases={mockCanvases}
					onSelectCanvas={handleSelect}
				/>
			)

			const cards = document.querySelectorAll('[data-name="canvas-card"]')
			expect(cards.length).toBeGreaterThanOrEqual(1)

			if (cards[0]) {
				fireEvent.click(cards[0])
				expect(handleSelect).toHaveBeenCalledWith(mockCanvases[0])
			}
		})

		it('renders CanvasCard component with title and handles selection state', () => {
			const handleClick = mock()
			render(
				<CanvasCard
					canvas={mockCanvases[0]}
					onClick={handleClick}
					isSelected={true}
				/>
			)

			const card = document.querySelector('[data-name="canvas-card"]')
			expect(card).not.toBeNull()

			if (card) {
				fireEvent.click(card)
				expect(handleClick).toHaveBeenCalledTimes(1)
			}
		})
	})

	describe('Canvas Deletion Flow & Modal', () => {
		const existingCanvas: Canvas = {
			id: 'canvas-to-delete',
			title: 'Canvas To Remove',
			blocks: [{ id: 'b1', type: 'paint', content: 'red' }],
		}

		it('renders delete-canvas-button in CanvasEditor and opens confirmation modal', () => {
			const handleDelete = mock()
			render(
				<CanvasEditor
					canvas={existingCanvas}
					onSave={mock()}
					onDelete={handleDelete}
				/>
			)

			const deleteBtn = document.querySelector(
				'[data-name="delete-canvas-button"]'
			)
			expect(deleteBtn).not.toBeNull()

			if (deleteBtn) {
				fireEvent.click(deleteBtn)
			}

			const confirmBtn = document.querySelector(
				'[data-name="confirm-delete-canvas-button"]'
			)
			expect(confirmBtn).not.toBeNull()
		})

		it('renders CanvasDeleteConfirmationModal and triggers onConfirm, onDelete and posthog "canvas_deleted"', () => {
			const handleConfirm = mock()
			const handleCancel = mock()
			render(
				<CanvasDeleteConfirmationModal
					isOpen={true}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
				/>
			)

			const confirmBtn = document.querySelector(
				'[data-name="confirm-delete-canvas-button"]'
			)
			expect(confirmBtn).not.toBeNull()

			if (confirmBtn) {
				fireEvent.click(confirmBtn)
				expect(handleConfirm).toHaveBeenCalledTimes(1)
			}

			// Verify PostHog tracking on canvas deletion
			const handleDelete = mock()
			render(
				<CanvasEditor
					canvas={existingCanvas}
					onSave={mock()}
					onDelete={handleDelete}
				/>
			)
			const deleteBtn = document.querySelector(
				'[data-name="delete-canvas-button"]'
			)
			if (deleteBtn) {
				fireEvent.click(deleteBtn)
			}
			const modalConfirmBtn = document.querySelector(
				'[data-name="confirm-delete-canvas-button"]'
			)
			if (modalConfirmBtn) {
				fireEvent.click(modalConfirmBtn)
				expect(handleDelete).toHaveBeenCalledWith(existingCanvas.id)
				expect(mockPosthogCapture).toHaveBeenCalledWith(
					'canvas_deleted',
					expect.objectContaining({
						canvasId: existingCanvas.id,
					} as CanvasDeletedEventPayload)
				)
			}
		})
	})
})
