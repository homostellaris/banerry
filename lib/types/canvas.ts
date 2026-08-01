/**
 * Canvas Feature Types & Component Contracts
 * Derived from feature spec: Banerry Canvas.md
 * and E2E requirements in cypress/e2e/canvas.cy.ts
 */

/**
 * Types of blocks that can be placed on a Canvas.
 */
export type CanvasBlockType =
	| 'script'
	| 'activity'
	| 'emoji'
	| 'letter'
	| 'number'
	| 'paint'

/**
 * Interface representing an individual block on a Canvas.
 */
export interface CanvasBlock {
	id: string
	type: CanvasBlockType
	content: string
	label?: string
	phrase?: string
	seed?: string
}

/**
 * Interface representing a Canvas document.
 */
export interface Canvas {
	id: string
	title: string
	learnerId?: string
	blocks: CanvasBlock[]
	createdAt?: number
	updatedAt?: number
}

/**
 * Component Props Contract: CanvasEmptyState
 * Rendered when a learner has no existing canvases.
 * Contains canvas-empty-state, canvas-example-preview, create-canvas-button.
 */
export interface CanvasEmptyStateProps {
	onCreateCanvas: () => void
	className?: string
}

/**
 * Component Props Contract: CanvasExamplePreview
 * Simple visual example of what a canvas might look like.
 */
export interface CanvasExamplePreviewProps {
	blocks?: CanvasBlock[]
	className?: string
}

/**
 * Component Props Contract: CanvasCarousel
 * Horizontal carousel displaying existing canvases.
 */
export interface CanvasCarouselProps {
	canvases: Canvas[]
	onSelectCanvas: (canvas: Canvas) => void
	selectedCanvasId?: string
	className?: string
}

/**
 * Component Props Contract: CanvasCard
 * Individual canvas card displayed within the carousel or list.
 */
export interface CanvasCardProps {
	canvas: Canvas
	onClick: () => void
	isSelected?: boolean
	className?: string
}

/**
 * Component Props Contract: CanvasBlockItem
 * Individual block item on a canvas. Tapping it triggers speech output and animation.
 */
export interface CanvasBlockItemProps {
	block: CanvasBlock
	onTap?: (block: CanvasBlock) => void
	isAnimating?: boolean
	className?: string
}

/**
 * Component Props Contract: CanvasEditor / CanvasView
 * Interface for creating/editing/viewing a canvas.
 * Manages canvas title input, adding blocks, saving, deleting, and block tap actions.
 */
export interface CanvasEditorProps {
	canvas?: Canvas | null
	onSave: (data: { title: string; blocks: CanvasBlock[] }) => void
	onDelete?: (canvasId: string) => void
	onBlockTap?: (block: CanvasBlock) => void
	className?: string
}

/**
 * Component Props Contract: CanvasDeleteConfirmationModal
 * Dialog/Modal for confirming permanent deletion of a canvas.
 */
export interface CanvasDeleteConfirmationModalProps {
	isOpen: boolean
	onConfirm: () => void
	onCancel: () => void
}

/**
 * PostHog Analytics Event Payloads for Canvas
 */
export interface CanvasCreatedEventPayload {
	title: string
	blockTypes: CanvasBlockType[]
}

export interface CanvasBlockTappedEventPayload {
	blockType: CanvasBlockType
	content: string
}

export interface CanvasDeletedEventPayload {
	canvasId?: string
}
