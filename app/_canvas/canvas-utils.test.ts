import { describe, it, expect, mock } from 'bun:test'
import {
	getDeterministicAnimation,
	formatBlockContent,
	parsePaintPath,
	calculateBlockBounds,
	isBlockSelected,
	snapToGrid,
	areBlocksEqual,
	hasCanvasChanged,
	debounceAutoSave,
	getSpeechText,
} from './canvas-utils'
import type { CanvasBlock } from './types'
import { GRID_SIZE } from './types'

describe('getDeterministicAnimation', () => {
	it('returns default animation when phrase is empty or whitespace', () => {
		const resultEmpty = getDeterministicAnimation('')
		expect(resultEmpty.animationClass).toBe('animate-none')
		expect(resultEmpty.transform).toBe('rotate(0deg) scale(1)')
		expect(resultEmpty.durationMs).toBe(1000)

		const resultSpace = getDeterministicAnimation('   ')
		expect(resultSpace.animationClass).toBe('animate-none')
	})

	it('returns deterministic output for the same input phrase', () => {
		const phrase = 'Hello Banerry Canvas'
		const result1 = getDeterministicAnimation(phrase)
		const result2 = getDeterministicAnimation(phrase)

		expect(result1.animationClass).toBe(result2.animationClass)
		expect(result1.transform).toBe(result2.transform)
		expect(result1.durationMs).toBe(result2.durationMs)
	})

	it('returns different parameters for different phrases', () => {
		const resA = getDeterministicAnimation('Alpha')
		const resB = getDeterministicAnimation('Beta')

		const isDifferent =
			resA.animationClass !== resB.animationClass ||
			resA.transform !== resB.transform ||
			resA.durationMs !== resB.durationMs

		expect(isDifferent).toBe(true)
	})

	it('generates valid CSS animation classes and transform bounds', () => {
		const res = getDeterministicAnimation('Test Expression')

		expect([
			'animate-bounce',
			'animate-pulse',
			'animate-wiggle',
			'animate-float',
		]).toContain(res.animationClass)

		expect(res.transform).toMatch(/^rotate\(-?\d+deg\) scale\(\d+\.\d+\)$/)
		expect(res.durationMs).toBeGreaterThanOrEqual(1000)
		expect(res.durationMs).toBeLessThanOrEqual(3000)
	})
})

describe('formatBlockContent', () => {
	it('returns empty string for null or empty block content', () => {
		const block: CanvasBlock = {
			id: 'b1',
			type: 'script',
			content: '',
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(block)).toBe('')
	})

	it('formats script block content with quotes', () => {
		const block: CanvasBlock = {
			id: 'b2',
			type: 'script',
			content: 'I want apple juice',
			x: 10,
			y: 10,
		}
		expect(formatBlockContent(block)).toBe('"I want apple juice"')

		const alreadyQuoted: CanvasBlock = {
			id: 'b3',
			type: 'script',
			content: '"Already quoted"',
			x: 10,
			y: 10,
		}
		expect(formatBlockContent(alreadyQuoted)).toBe('"Already quoted"')
	})

	it('formats activity block content with target icon', () => {
		const block: CanvasBlock = {
			id: 'b4',
			type: 'activity',
			content: 'Brush Teeth',
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(block)).toBe('🎯 Brush Teeth')

		const alreadyIconed: CanvasBlock = {
			id: 'b5',
			type: 'activity',
			content: '🎯 Wash Hands',
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(alreadyIconed)).toBe('🎯 Wash Hands')
	})

	it('formats activity block with activity image without duplicating target icon', () => {
		const blockWithImg: CanvasBlock = {
			id: 'b-img',
			type: 'activity',
			content: 'Brush Teeth',
			imageUrl: 'https://example.com/teeth.png',
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(blockWithImg)).toBe('Brush Teeth')
	})

	it('formats transparent blocks correctly preserving content format', () => {
		const transparentScript: CanvasBlock = {
			id: 'b-trans',
			type: 'script',
			content: 'Transparent Script',
			isTransparent: true,
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(transparentScript)).toBe('"Transparent Script"')

		const transparentActivity: CanvasBlock = {
			id: 'b-trans-act',
			type: 'activity',
			content: 'Transparent Activity',
			isTransparent: true,
			imageUrl: 'https://example.com/act.png',
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(transparentActivity)).toBe('Transparent Activity')
	})

	it('formats emoji block content correctly', () => {
		const block: CanvasBlock = {
			id: 'b6',
			type: 'emoji',
			content: '🚀',
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(block)).toBe('🚀')
	})

	it('formats letter block content to uppercase', () => {
		const block: CanvasBlock = {
			id: 'b7',
			type: 'letter',
			content: 'hello world',
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(block)).toBe('HELLO WORLD')
	})

	it('formats number block content correctly', () => {
		const block: CanvasBlock = {
			id: 'b8',
			type: 'number',
			content: '1234567',
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(block)).toBe('1,234,567')
	})

	it('formats paint block content summary', () => {
		const jsonPaint: CanvasBlock = {
			id: 'b9',
			type: 'paint',
			content: '[{"x":0,"y":0},{"x":10,"y":10},{"x":20,"y":20}]',
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(jsonPaint)).toBe('Stroke (3 pts)')

		const pathPaint: CanvasBlock = {
			id: 'b10',
			type: 'paint',
			content: 'M 0 0 L 10 10',
			x: 0,
			y: 0,
		}
		expect(formatBlockContent(pathPaint)).toBe('Path (13 chars)')
	})
})

describe('parsePaintPath utilities', () => {
	it('parses JSON array string of coordinates into point array', () => {
		const jsonStr = JSON.stringify([
			{ x: 10, y: 20 },
			{ x: 30, y: 40 },
			{ x: 50, y: 60 },
		])
		const points = parsePaintPath(jsonStr)

		expect(points).toHaveLength(3)
		expect(points[0]).toEqual({ x: 10, y: 20 })
		expect(points[1]).toEqual({ x: 30, y: 40 })
		expect(points[2]).toEqual({ x: 50, y: 60 })
	})

	it('filters out invalid or non-numeric items in JSON point arrays', () => {
		const jsonStr = JSON.stringify([
			{ x: 10, y: 20 },
			null,
			{ x: 'invalid', y: 30 },
			{ x: 40, y: 50 },
		])
		const points = parsePaintPath(jsonStr)

		expect(points).toHaveLength(2)
		expect(points[0]).toEqual({ x: 10, y: 20 })
		expect(points[1]).toEqual({ x: 40, y: 50 })
	})

	it('parses SVG path command strings into points', () => {
		const svgStr = 'M 10 20 L 30 40 L 50 60'
		const points = parsePaintPath(svgStr)

		expect(points).toHaveLength(3)
		expect(points[0]).toEqual({ x: 10, y: 20 })
		expect(points[1]).toEqual({ x: 30, y: 40 })
		expect(points[2]).toEqual({ x: 50, y: 60 })
	})

	it('handles SVG path strings with comma separators and decimal values', () => {
		const svgStr = 'M 12.5,25.5 L 37.5,50.0'
		const points = parsePaintPath(svgStr)

		expect(points).toHaveLength(2)
		expect(points[0]).toEqual({ x: 12.5, y: 25.5 })
		expect(points[1]).toEqual({ x: 37.5, y: 50.0 })
	})

	it('returns empty array for invalid paint content', () => {
		expect(parsePaintPath('')).toEqual([])
		expect(parsePaintPath('invalid string')).toEqual([])
		expect(parsePaintPath('{}')).toEqual([])
	})
})

describe('calculateBlockBounds', () => {
	it('returns zeros for empty block array', () => {
		const bounds = calculateBlockBounds([])
		expect(bounds).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 })
	})

	it('calculates bounding box accurately for multiple blocks', () => {
		const blocks: CanvasBlock[] = [
			{ id: '1', type: 'emoji', content: '😀', x: 50, y: 50, width: 100, height: 100 },
			{ id: '2', type: 'letter', content: 'A', x: 200, y: 150, width: 50, height: 50 },
		]
		const bounds = calculateBlockBounds(blocks)

		expect(bounds.minX).toBe(50)
		expect(bounds.minY).toBe(50)
		expect(bounds.maxX).toBe(250)
		expect(bounds.maxY).toBe(200)
		expect(bounds.width).toBe(200)
		expect(bounds.height).toBe(150)
	})
})

describe('isBlockSelected', () => {
	it('returns true when block ID matches selected ID', () => {
		expect(isBlockSelected('block-123', 'block-123')).toBe(true)
	})

	it('returns false when block IDs do not match or selectedId is null', () => {
		expect(isBlockSelected('block-123', 'block-456')).toBe(false)
		expect(isBlockSelected(null, 'block-123')).toBe(false)
		expect(isBlockSelected(undefined, 'block-123')).toBe(false)
	})
})

describe('snapToGrid and snap-on-release helpers', () => {
	it('snaps raw drag release coordinates (x, y) to grid increments', () => {
		const dragReleaseX = 47
		const dragReleaseY = 112

		const snappedX = snapToGrid(dragReleaseX)
		const snappedY = snapToGrid(dragReleaseY)

		expect(snappedX).toBe(40)
		expect(snappedY).toBe(120)
	})

	it('snaps values to nearest GRID_SIZE (default 20)', () => {
		expect(GRID_SIZE).toBe(20)
		expect(snapToGrid(0)).toBe(0)
		expect(snapToGrid(9)).toBe(0)
		expect(snapToGrid(10)).toBe(20)
		expect(snapToGrid(11)).toBe(20)
		expect(snapToGrid(25)).toBe(20)
		expect(snapToGrid(30)).toBe(40)
		expect(snapToGrid(35)).toBe(40)
		expect(snapToGrid(100)).toBe(100)
	})

	it('snaps negative release coordinates correctly to grid increments', () => {
		expect(snapToGrid(-9)).toBe(-0)
		expect(snapToGrid(-11)).toBe(-20)
		expect(snapToGrid(-25)).toBe(-20)
		expect(snapToGrid(-31)).toBe(-40)
	})

	it('handles floating point values during snap-on-release', () => {
		expect(snapToGrid(10.4)).toBe(20)
		expect(snapToGrid(9.9, 10)).toBe(10)
		expect(snapToGrid(14.2, 5)).toBe(15)
	})

	it('snaps values to custom grid size when specified on release', () => {
		expect(snapToGrid(12, 10)).toBe(10)
		expect(snapToGrid(17, 10)).toBe(20)
		expect(snapToGrid(44, 50)).toBe(50)
		expect(snapToGrid(77, 25)).toBe(75)
		expect(snapToGrid(88, 100)).toBe(100)
	})

	it('calculates snapped release bounds for block movement', () => {
		const rawPosition = { x: 133, y: 267 }
		const snappedPosition = {
			x: snapToGrid(rawPosition.x),
			y: snapToGrid(rawPosition.y),
		}

		expect(snappedPosition).toEqual({ x: 140, y: 260 })
	})
})

describe('auto-save debouncing & block diffing helpers', () => {
	it('areBlocksEqual returns true for identical block lists', () => {
		const blocksA: CanvasBlock[] = [
			{ id: 'b1', type: 'emoji', content: '😀', x: 20, y: 20 },
			{ id: 'b2', type: 'letter', content: 'A', x: 60, y: 60, isTransparent: true },
		]
		const blocksB: CanvasBlock[] = [
			{ id: 'b1', type: 'emoji', content: '😀', x: 20, y: 20 },
			{ id: 'b2', type: 'letter', content: 'A', x: 60, y: 60, isTransparent: true },
		]

		expect(areBlocksEqual(blocksA, blocksB)).toBe(true)
		expect(hasCanvasChanged(blocksA, blocksB)).toBe(false)
	})

	it('areBlocksEqual returns false when block position, content, or transparency differs', () => {
		const base: CanvasBlock[] = [
			{ id: 'b1', type: 'emoji', content: '😀', x: 20, y: 20 },
		]
		const moved: CanvasBlock[] = [
			{ id: 'b1', type: 'emoji', content: '😀', x: 40, y: 20 },
		]
		const edited: CanvasBlock[] = [
			{ id: 'b1', type: 'emoji', content: '😎', x: 20, y: 20 },
		]
		const transparent: CanvasBlock[] = [
			{ id: 'b1', type: 'emoji', content: '😀', x: 20, y: 20, isTransparent: true },
		]
		const extraBlock: CanvasBlock[] = [
			{ id: 'b1', type: 'emoji', content: '😀', x: 20, y: 20 },
			{ id: 'b2', type: 'letter', content: 'B', x: 80, y: 80 },
		]

		expect(areBlocksEqual(base, moved)).toBe(false)
		expect(hasCanvasChanged(base, moved)).toBe(true)

		expect(areBlocksEqual(base, edited)).toBe(false)
		expect(hasCanvasChanged(base, edited)).toBe(true)

		expect(areBlocksEqual(base, transparent)).toBe(false)
		expect(hasCanvasChanged(base, transparent)).toBe(true)

		expect(areBlocksEqual(base, extraBlock)).toBe(false)
		expect(hasCanvasChanged(base, extraBlock)).toBe(true)
	})

	it('debounceAutoSave delays execution and collapses multiple rapid invocations', async () => {
		const callback = mock(() => {})
		const debounced = debounceAutoSave(callback, 50)

		debounced('Title 1', [])
		debounced('Title 2', [])
		debounced('Title 3', [])

		expect(callback).toHaveBeenCalledTimes(0)

		await new Promise(resolve => setTimeout(resolve, 80))

		expect(callback).toHaveBeenCalledTimes(1)
		expect(callback).toHaveBeenCalledWith('Title 3', [])
	})
})

describe('getSpeechText', () => {
	it('returns spoken description for emoji blocks', () => {
		expect(getSpeechText({ id: '1', type: 'emoji', content: '😀', x: 0, y: 0 })).toBe('Grinning face')
		expect(getSpeechText({ id: '2', type: 'emoji', content: '🚀', x: 0, y: 0 })).toBe('Rocket')
		expect(getSpeechText({ id: '3', type: 'emoji', content: '🍕', x: 0, y: 0 })).toBe('Pizza')
		expect(getSpeechText({ id: '4', type: 'emoji', content: '🐶', x: 0, y: 0 })).toBe('Dog')
	})

	it('returns spoken words for arithmetic symbols in number blocks', () => {
		expect(getSpeechText({ id: '1', type: 'number', content: '+', x: 0, y: 0 })).toBe('Plus')
		expect(getSpeechText({ id: '2', type: 'number', content: '-', x: 0, y: 0 })).toBe('Minus')
		expect(getSpeechText({ id: '3', type: 'number', content: '=', x: 0, y: 0 })).toBe('Equals')
		expect(getSpeechText({ id: '4', type: 'number', content: '×', x: 0, y: 0 })).toBe('Times')
		expect(getSpeechText({ id: '5', type: 'number', content: '÷', x: 0, y: 0 })).toBe('Divided by')
		expect(getSpeechText({ id: '6', type: 'number', content: '42', x: 0, y: 0 })).toBe('42')
	})

	it('returns dialogue or activity title directly for script and activity blocks', () => {
		expect(getSpeechText({ id: '1', type: 'script', content: 'I want water', x: 0, y: 0 })).toBe('I want water')
		expect(getSpeechText({ id: '2', type: 'activity', content: 'Brush Teeth', x: 0, y: 0 })).toBe('Brush Teeth')
	})
})
