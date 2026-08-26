import type { CanvasBlock } from './types'
import { GRID_SIZE } from './types'

/**
 * Snaps a numeric coordinate to the nearest grid increment.
 */
export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
	return Math.round(value / gridSize) * gridSize
}

export interface AnimationParams {
	animationClass: string
	transform: string
	durationMs: number
}

/**
 * Calculates deterministic animation class and CSS transform parameters using a phrase string seed.
 */
export function getDeterministicAnimation(phrase: string): AnimationParams {
	if (!phrase || phrase.trim() === '') {
		return {
			animationClass: 'animate-none',
			transform: 'rotate(0deg) scale(1)',
			durationMs: 1000,
		}
	}

	// Simple djb2 hash algorithm for deterministic seed
	let hash = 5381
	for (let i = 0; i < phrase.length; i++) {
		hash = (hash * 33) ^ phrase.charCodeAt(i)
	}
	const positiveHash = Math.abs(hash)

	const animationClasses = [
		'animate-bounce',
		'animate-pulse',
		'animate-wiggle',
		'animate-float',
	]
	const animationClass = animationClasses[positiveHash % animationClasses.length]

	const rotationDeg = (positiveHash % 15) - 7 // -7 to 7 deg
	const scaleVal = 0.95 + ((positiveHash % 15) / 100) // 0.95 to 1.10
	const transform = `rotate(${rotationDeg}deg) scale(${scaleVal.toFixed(2)})`

	const durationMs = 1000 + (positiveHash % 2000) // 1000ms to 3000ms

	return {
		animationClass,
		transform,
		durationMs,
	}
}

/**
 * Formats content of a canvas block based on its block type.
 */
export function formatBlockContent(block: CanvasBlock): string {
	if (!block || !block.content) {
		return ''
	}

	const content = block.content.trim()

	switch (block.type) {
		case 'script':
			return content.startsWith('"') && content.endsWith('"')
				? content
				: `"${content}"`
		case 'activity':
			if (block.imageUrl || block.imageStorageId) {
				return content.startsWith('🎯') ? content.slice(2).trim() : content
			}
			return content.startsWith('🎯') ? content : `🎯 ${content}`
		case 'emoji':
			return content
		case 'letter':
			return content.toUpperCase()
		case 'number': {
			const num = Number(content)
			return isNaN(num) ? content : num.toLocaleString()
		}
		case 'paint':
			if (content.startsWith('[') || content.startsWith('{')) {
				try {
					const points = JSON.parse(content)
					if (Array.isArray(points)) {
						return `Stroke (${points.length} pts)`
					}
				} catch {
					// fallback to content
				}
			}
			return content.startsWith('M') ? `Path (${content.length} chars)` : content
		default:
			return content
	}
}

export const EMOJI_DESCRIPTIONS: Record<string, string> = {
	'😀': 'Grinning face',
	'😃': 'Happy face',
	'😄': 'Smiling face',
	'😁': 'Beaming smile',
	'😅': 'Sweaty smile',
	'😂': 'Laughing face',
	'🙂': 'Slightly smiling face',
	'😊': 'Warm smile',
	'😇': 'Angel face',
	'🥰': 'Love face',
	'😍': 'Heart eyes',
	'🤩': 'Star eyes',
	'😘': 'Blowing a kiss',
	'😋': 'Yummy face',
	'😜': 'Winking tongue',
	'🤪': 'Zany face',
	'😎': 'Cool sunglasses',
	'🥳': 'Party face',
	'🤗': 'Hugging face',
	'👍': 'Thumbs up',
	'👏': 'Clapping hands',
	'🙌': 'Raising hands',
	'❤️': 'Red heart',
	'⭐': 'Star',
	'🌟': 'Glowing star',
	'🎉': 'Party popper',
	'🎨': 'Artist palette',
	'🚀': 'Rocket',
	'💡': 'Light bulb',
	'🍎': 'Red apple',
	'🍕': 'Pizza',
	'🍔': 'Burger',
	'🍦': 'Ice cream',
	'🍪': 'Cookie',
	'🍌': 'Banana',
	'🐶': 'Dog',
	'🐱': 'Cat',
	'🚗': 'Car',
	'🧸': 'Teddy bear',
	'📚': 'Books',
	'💧': 'Water drop',
	'🎈': 'Balloon',
	'⚽': 'Soccer ball',
	'🎮': 'Video game controller',
	'🎵': 'Musical note',
	'☀️': 'Sun',
	'🌈': 'Rainbow',
	'🔥': 'Fire',
	'⚡': 'Lightning bolt',
	'🏆': 'Trophy',
}

/**
 * Returns spoken word/text representation for TTS audio playback of a canvas block.
 */
export function getSpeechText(block: CanvasBlock): string {
	if (!block || !block.content) return ''
	const raw = block.content.trim()

	if (block.type === 'emoji') {
		const description = EMOJI_DESCRIPTIONS[raw]
		if (description) return description
		return raw || 'Emoji'
	}

	if (block.type === 'number') {
		if (raw === '+') return 'Plus'
		if (raw === '-') return 'Minus'
		if (raw === '=') return 'Equals'
		if (raw === '×') return 'Times'
		if (raw === '÷') return 'Divided by'
		return raw
	}

	return raw
}
export function parsePaintPath(content: string): Array<{ x: number; y: number }> {
	if (!content) return []

	if (content.startsWith('[') || content.startsWith('{')) {
		try {
			const parsed = JSON.parse(content)
			if (Array.isArray(parsed)) {
				return parsed.filter(
					pt => typeof pt === 'object' && pt !== null && typeof pt.x === 'number' && typeof pt.y === 'number'
				)
			}
		} catch {
			return []
		}
	}

	// SVG path data parser fallback e.g. "M 10 20 L 30 40"
	const points: Array<{ x: number; y: number }> = []
	const matches = content.matchAll(/([ML])\s*(-?\d+(?:\.\d+)?)\s*,?\s*(-?\d+(?:\.\d+)?)/gi)
	for (const match of matches) {
		const x = parseFloat(match[2])
		const y = parseFloat(match[3])
		if (!isNaN(x) && !isNaN(y)) {
			points.push({ x, y })
		}
	}

	return points
}

/**
 * Computes bounding box dimensions of a set of canvas blocks.
 */
export function calculateBlockBounds(blocks: CanvasBlock[]): {
	minX: number
	minY: number
	maxX: number
	maxY: number
	width: number
	height: number
} {
	if (!blocks || blocks.length === 0) {
		return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
	}

	let minX = Infinity
	let minY = Infinity
	let maxX = -Infinity
	let maxY = -Infinity

	for (const block of blocks) {
		const blockWidth = block.width || 100
		const blockHeight = block.height || 60

		if (block.x < minX) minX = block.x
		if (block.y < minY) minY = block.y
		if (block.x + blockWidth > maxX) maxX = block.x + blockWidth
		if (block.y + blockHeight > maxY) maxY = block.y + blockHeight
	}

	return {
		minX,
		minY,
		maxX,
		maxY,
		width: maxX - minX,
		height: maxY - minY,
	}
}

/**
 * Checks if a canvas block is currently selected.
 */
export function isBlockSelected(
	selectedId: string | null | undefined,
	blockId: string
): boolean {
	if (!selectedId || !blockId) return false
	return selectedId === blockId
}

/**
 * Compares two lists of canvas blocks for structural equality.
 */
export function areBlocksEqual(
	b1: CanvasBlock[] = [],
	b2: CanvasBlock[] = []
): boolean {
	if (b1 === b2) return true
	if (!b1 || !b2) return false
	if (b1.length !== b2.length) return false

	for (let i = 0; i < b1.length; i++) {
		const blockA = b1[i]
		const blockB = b2[i]

		if (
			blockA.id !== blockB.id ||
			blockA.type !== blockB.type ||
			blockA.content !== blockB.content ||
			blockA.x !== blockB.x ||
			blockA.y !== blockB.y ||
			blockA.width !== blockB.width ||
			blockA.height !== blockB.height ||
			blockA.color !== blockB.color ||
			blockA.isTransparent !== blockB.isTransparent ||
			blockA.sourceId !== blockB.sourceId ||
			blockA.imageStorageId !== blockB.imageStorageId ||
			blockA.imageUrl !== blockB.imageUrl ||
			blockA.strokeWidth !== blockB.strokeWidth ||
			blockA.strokeColor !== blockB.strokeColor
		) {
			return false
		}

		if (blockA.points || blockB.points) {
			if (!blockA.points || !blockB.points) return false
			if (blockA.points.length !== blockB.points.length) return false
			for (let j = 0; j < blockA.points.length; j++) {
				if (
					blockA.points[j].x !== blockB.points[j].x ||
					blockA.points[j].y !== blockB.points[j].y
				) {
					return false
				}
			}
		}
	}

	return true
}

/**
 * Checks if a canvas title or block list has changed.
 * Supports overload signatures: (blocksA, blocksB) or (canvas, newName, newBlocks).
 */
export function hasCanvasChanged(
	arg1: CanvasBlock[] | any,
	arg2: CanvasBlock[] | string,
	arg3?: CanvasBlock[]
): boolean {
	if (Array.isArray(arg1) && Array.isArray(arg2)) {
		return !areBlocksEqual(arg1, arg2)
	}

	const canvas = arg1 as any
	const newName = arg2 as string
	const newBlocks = arg3 as CanvasBlock[]

	if (!canvas) return true
	if (canvas.name !== newName) return true
	return !areBlocksEqual(canvas.blocks || [], newBlocks || [])
}

/**
 * Debounces execution of auto-save callback functions.
 */
export function debounceAutoSave<T extends (...args: any[]) => any>(
	fn: T,
	delayMs: number = 500
): (...args: any[]) => void {
	let timer: ReturnType<typeof setTimeout> | null = null
	return (...args: any[]) => {
		if (timer) {
			clearTimeout(timer)
		}
		timer = setTimeout(() => {
			fn(...args)
		}, delayMs)
	}
}
