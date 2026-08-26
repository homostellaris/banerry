import React from 'react'
import { PaintLayer } from '@/app/_canvas/paint-layer'
import type { PaintStroke } from '@/app/_canvas/types'

const mockStrokes: PaintStroke[] = [
	{
		id: 'stroke-1',
		color: '#ef4444',
		size: 6,
		points: [
			{ x: 10, y: 10 },
			{ x: 20, y: 25 },
			{ x: 30, y: 40 },
		],
	},
	{
		id: 'stroke-2',
		color: '#10b981',
		size: 10,
		points: [
			{ x: 50, y: 50 },
			{ x: 70, y: 80 },
		],
	},
]

describe('PaintLayer Component', () => {
	it('renders container with default brush mode, color, and brush size attributes', () => {
		cy.mount(<PaintLayer />)

		cy.get('div.pointer-events-auto')
			.should('have.attr', 'data-mode', 'draw')
			.and('have.attr', 'data-color', '#3b82f6')
			.and('have.attr', 'data-brush-size', '4')
	})

	it('renders with custom mode, brush color, and brush size selection', () => {
		cy.mount(
			<PaintLayer
				mode="erase"
				currentColor="#f59e0b"
				brushSize={12}
			/>,
		)

		cy.get('div.pointer-events-auto')
			.should('have.attr', 'data-mode', 'erase')
			.and('have.attr', 'data-color', '#f59e0b')
			.and('have.attr', 'data-brush-size', '12')
	})

	it('renders SVG polyline elements for provided paint strokes', () => {
		cy.mount(<PaintLayer strokes={mockStrokes} />)

		cy.get('svg').should('be.visible')
		cy.get('polyline').should('have.length', 2)

		cy.get('polyline')
			.eq(0)
			.should('have.attr', 'stroke', '#ef4444')
			.and('have.attr', 'stroke-width', '6')
			.and('have.attr', 'points', '10,10 20,25 30,40')

		cy.get('polyline')
			.eq(1)
			.should('have.attr', 'stroke', '#10b981')
			.and('have.attr', 'stroke-width', '10')
			.and('have.attr', 'points', '50,50 70,80')
	})

	it('triggers onStrokeComplete callback when drawing is completed', () => {
		const onStrokeComplete = cy.stub()
		cy.mount(
			<PaintLayer
				onStrokeComplete={onStrokeComplete}
			/>,
		)

		cy.get('[data-name="paint-layer"]')
			.trigger('mousedown', { button: 0, clientX: 10, clientY: 10 })
			.trigger('mousemove', { button: 0, clientX: 20, clientY: 20 })
			.trigger('mouseup', { button: 0 })

		cy.wrap(onStrokeComplete).should('have.been.calledOnce')
	})

	it('triggers onClearStrokes callback on clear button click event', () => {
		const onClearStrokes = cy.stub()
		cy.mount(<PaintLayer onClearStrokes={onClearStrokes} />)

		cy.contains('button', 'Clear').click()
		cy.wrap(onClearStrokes).should('have.been.calledOnce')
	})
})
