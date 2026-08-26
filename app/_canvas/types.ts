import type { Id } from '../../convex/_generated/dataModel'

/**
 * Default canvas dot grid background size in pixels.
 */
export const GRID_SIZE = 20

/**
 * Utility contract for snapping coordinates to grid increments.
 */
export type SnapToGridFn = (value: number, gridSize?: number) => number

/**
 * Paint tool mode options for canvas freeform drawing layer.
 */
export type PaintMode = 'draw' | 'erase' | 'select'

/**
 * Single paint stroke for touch/mouse freeform drawing layer.
 */
export interface PaintStroke {
	id: string
	points: Array<{ x: number; y: number }>
	color: string
	size: number
}

/**
 * Props for the paint layer component.
 */
export interface PaintLayerProps {
	mode?: PaintMode
	currentColor?: string
	brushSize?: number
	strokes?: PaintStroke[]
	onStrokeComplete?: (stroke: PaintStroke) => void
	onClearStrokes?: () => void
}

/**
 * Supported block types for canvas expressions.
 * - `script`: sources content from learner's existing scripts (`scripts` table)
 * - `activity`: sources content from learner's active board columns (`boards` table where `isActive === true`)
 * - `emoji`: emoji character/icon
 * - `letter`: text letter / phrase
 * - `number`: numerical expression
 * - `paint`: stroke / drawing paths
 */
export type BlockType =
	| 'script'
	| 'activity'
	| 'emoji'
	| 'letter'
	| 'number'
	| 'paint' // kept optional for backward compatibility

/**
 * Individual block item on a canvas.
 */
export interface CanvasBlock {
	id: string
	type: BlockType
	content: string
	x: number
	y: number
	width?: number
	height?: number
	color?: string
	sourceId?: string
	imageStorageId?: Id<'_storage'> | string
	imageUrl?: string
	strokeWidth?: number
	strokeColor?: string
	points?: Array<{ x: number; y: number }>
	isTransparent?: boolean
}

/**
 * Canvas record matching Convex data model.
 */
export interface Canvas {
	_id: Id<'canvases'> | string
	_creationTime?: number
	learnerId: Id<'learners'> | string
	name: string
	blocks: CanvasBlock[]
	createdAt: number
}

/**
 * Represents a script item option.
 */
export interface ScriptItem {
	_id: string
	dialogue: string
	parentheticals?: string
}

/**
 * Represents an activity column item option.
 */
export interface ActivityItem {
	id: string
	title: string
	imageStorageId?: Id<'_storage'> | string
	imagePrompt?: string
	imageUrl?: string
}

/**
 * Default preset emoji options for EmojiPicker.
 */
export const EMOJI_OPTIONS: readonly string[] = [
	'😀', '😃', '😄', '😁', '😅', '😂', '🙂', '😊', '😇', '🥰',
	'😍', '🤩', '😘', '😋', '😜', '🤪', '😎', '🥳', '🤗', '👍',
	'👏', '🙌', '❤️', '⭐', '🌟', '🎉', '🎨', '🚀', '💡', '🍎',
	'🐶', '🐱', '⚽', '🎮', '🎵', '☀️', '🌈', '🔥', '⚡', '🏆',
]

/**
 * Default preset letter options for LetterPicker.
 */
export const LETTER_OPTIONS: readonly string[] = [
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
	'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
	'U', 'V', 'W', 'X', 'Y', 'Z',
]

/**
 * Default preset number & symbol options for NumberPicker.
 */
export const NUMBER_OPTIONS: readonly string[] = [
	'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
	'10', '+', '-', '=', '×', '÷',
]

/**
 * Props for ScriptPicker Modal component.
 */
export interface ScriptPickerProps {
	isOpen: boolean
	scripts: ScriptItem[]
	selectedScriptId?: string
	onSelectScript: (script: ScriptItem) => void
	onClose: () => void
}

/**
 * Props for ActivityPicker Modal component.
 */
export interface ActivityPickerProps {
	isOpen: boolean
	activities: ActivityItem[]
	selectedActivityId?: string
	onSelectActivity: (activity: ActivityItem) => void
	onClose: () => void
}

/**
 * Props for EmojiPicker Modal component.
 */
export interface EmojiPickerProps {
	isOpen: boolean
	selectedEmoji?: string
	onSelectEmoji: (emoji: string) => void
	onClose: () => void
}

/**
 * Props for LetterPicker Modal component.
 */
export interface LetterPickerProps {
	isOpen: boolean
	selectedLetter?: string
	onSelectLetter: (letter: string) => void
	onClose: () => void
}

/**
 * Props for NumberPicker Modal component.
 */
export interface NumberPickerProps {
	isOpen: boolean
	selectedNumber?: string
	onSelectNumber: (num: string) => void
	onClose: () => void
}

/**
 * Props for individual block preview in the palette.
 */
export interface PaletteBlockProps {
	type: BlockType
	label: string
	icon?: string
	onSelect?: (type: BlockType, content?: string) => void
}

/**
 * Props for the block palette container.
 */
export interface BlockPaletteProps {
	onSelectBlockType: (type: BlockType, content?: string) => void
	scripts?: ScriptItem[]
	activeBoardColumns?: ActivityItem[]
}

/**
 * Props for displaying a rendered canvas.
 */
export interface CanvasDisplayProps {
	canvas: Canvas
	onSelectBlock?: (block: CanvasBlock) => void
}

/**
 * Props for the canvas horizontal carousel in the top persistent section.
 */
export interface CanvasCarouselProps {
	canvases: Canvas[]
	onSelectCanvas: (canvas: Canvas) => void
	onCreateNew: () => void
	activeCanvasId?: Id<'canvases'> | string | null
	selectedCanvasId?: Id<'canvases'> | string | null
	onDeleteCanvas?: (id: string) => void
	onRenameCanvas?: (id: string, name: string) => void
	readOnly?: boolean
}

/**
 * Props for the canvas editor interface with live auto-save and Read/Edit Mode support.
 */
export interface CanvasEditorProps {
	canvas?: Canvas | null
	passphrase: string
	onSave?: (name: string, blocks: CanvasBlock[]) => void
	onAutoSave?: (name: string, blocks: CanvasBlock[]) => void
	onDelete?: (id: string) => void
	onClose?: () => void
	onRename?: (name: string) => void
	scripts?: ScriptItem[]
	activeBoardColumns?: ActivityItem[]
	isGridSnappingEnabled?: boolean
	paintMode?: PaintMode
	autoSaveDelayMs?: number
	isAutoSaving?: boolean
	isEditingMode?: boolean
	onToggleEditMode?: () => void
	readOnly?: boolean
}

/**
 * Props for rendered individual canvas block items inside editor or view.
 * Includes drag, edit content, transparent block container, Read/Edit Mode, and action handlers.
 */
export interface CanvasBlockItemProps {
	block: CanvasBlock
	isSelected?: boolean
	isTransparent?: boolean
	isEditingMode?: boolean
	readOnly?: boolean
	onTap?: (block: CanvasBlock) => void
	onSelect?: (block: CanvasBlock) => void
	onMove?: (id: string, x: number, y: number) => void
	onDelete?: (id: string) => void
	onDragStart?: (id: string, e: React.MouseEvent | React.TouchEvent) => void
	onDragEnd?: (id: string, newX: number, newY: number) => void
	onEditContent?: (id: string, newContent: string) => void
	onChangeScriptOrActivity?: (block: CanvasBlock) => void
}

/**
 * Props for top-level Canvas page content matching persistent boards space layout.
 */
export interface CanvasPageContentProps {
	passphrase?: string
	initialCanvasId?: Id<'canvases'> | string
	readOnly?: boolean
}

/**
 * Standard data-name selectors for Canvas UI testing & contract verification:
 * - `data-name="canvas-empty-prompt"`: Prompt shown when no canvases exist
 * - `data-name="create-canvas-btn"`: Button to initiate new canvas creation
 * - `data-name="canvas-carousel"`: Horizontal carousel container displaying existing canvases
 * - `data-name="canvas-card"`: Individual canvas preview card in carousel
 * - `data-name="canvas-editor"`: Main workspace editor container
 * - `data-name="canvas-block-[type]"`: Placed canvas block element (type = script | activity | emoji | letter | number | paint)
 * - `data-name="save-canvas-btn"`: Action button to save current canvas
 * - `data-name="delete-canvas-btn"`: Action button to open delete confirmation dialog
 * - `data-name="delete-canvas-confirm-btn"`: Confirmation button to permanently delete canvas
 * - `data-name="block-palette"`: Palette panel containing block types to place
 * - `data-name="script-picker-modal"`: Script picker modal container
 * - `data-name="activity-picker-modal"`: Activity picker modal container
 * - `data-name="script-item-option"`: Script item option in picker
 * - `data-name="activity-item-option"`: Activity item option in picker
 * - `data-name="emoji-picker-modal"`: Emoji picker modal container
 * - `data-name="emoji-item-option"`: Emoji item option in picker
 * - `data-name="letter-picker-modal"`: Letter picker modal container
 * - `data-name="letter-item-option"`: Letter item option in picker
 * - `data-name="number-picker-modal"`: Number picker modal container
 * - `data-name="number-item-option"`: Number item option in picker
 * - `data-name="paint-layer"`: Paint drawing layer container
 * - `data-name="auto-save-indicator"`: Indicator showing auto-save status
 * - `data-name="activity-block-image"`: Image container within activity blocks
 * - `data-name="toggle-edit-mode-btn"`: Button to toggle between Read Mode and Edit Mode
 * - `data-name="block-speech-btn"`: Audio speech button on block cards
 * - `data-name="canvas-title"`: Title display element in Read Mode
 * - `data-name="canvas-read-mode"`: Read mode workspace container
 * - `data-name="canvas-edit-mode"`: Edit mode workspace container
 */
export const CANVAS_DATA_NAMES = {
	EMPTY_PROMPT: 'canvas-empty-prompt',
	CREATE_CANVAS_BTN: 'create-canvas-btn',
	CAROUSEL: 'canvas-carousel',
	CARD: 'canvas-card',
	EDITOR: 'canvas-editor',
	BLOCK_PREFIX: 'canvas-block-',
	SAVE_BTN: 'save-canvas-btn',
	DELETE_BTN: 'delete-canvas-btn',
	DELETE_CONFIRM_BTN: 'delete-canvas-confirm-btn',
	BLOCK_PALETTE: 'block-palette',
	SCRIPT_PICKER_MODAL: 'script-picker-modal',
	ACTIVITY_PICKER_MODAL: 'activity-picker-modal',
	SCRIPT_ITEM_OPTION: 'script-item-option',
	ACTIVITY_ITEM_OPTION: 'activity-item-option',
	EMOJI_PICKER_MODAL: 'emoji-picker-modal',
	EMOJI_ITEM_OPTION: 'emoji-item-option',
	LETTER_PICKER_MODAL: 'letter-picker-modal',
	LETTER_ITEM_OPTION: 'letter-item-option',
	NUMBER_PICKER_MODAL: 'number-picker-modal',
	NUMBER_ITEM_OPTION: 'number-item-option',
	PAINT_LAYER: 'paint-layer',
	AUTO_SAVE_INDICATOR: 'auto-save-indicator',
	ACTIVITY_IMAGE_CONTAINER: 'activity-block-image',
	TOGGLE_EDIT_MODE_BTN: 'toggle-edit-mode-btn',
	BLOCK_SPEECH_BTN: 'block-speech-btn',
	CANVAS_TITLE: 'canvas-title',
	READ_MODE_VIEW: 'canvas-read-mode',
	EDIT_MODE_VIEW: 'canvas-edit-mode',
	MOVE_LEFT_BTN: 'move-left-btn',
	MOVE_UP_BTN: 'move-up-btn',
	MOVE_RIGHT_BTN: 'move-right-btn',
	MOVE_DOWN_BTN: 'move-down-btn',
	EDIT_BLOCK_BTN: 'edit-block-btn',
	DELETE_BLOCK_BTN: 'delete-block-btn',
} as const

