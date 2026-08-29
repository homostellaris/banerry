import React from 'react'
import { CanvasCarousel } from '@/app/_canvas/canvas-carousel'
import type { Canvas } from '@/app/_canvas/types'

const mockCanvases: Canvas[] = [
	{
		_id: 'canvas-1',
		learnerId: 'learner-1',
		name: 'Morning Routine Canvas',
		createdAt: 1700000000000,
		blocks: [
			{ id: 'b1', type: 'emoji', content: '🌅', x: 10, y: 10 },
			{ id: 'b2', type: 'letter', content: 'SUN', x: 50, y: 50 },
		],
	},
	{
		_id: 'canvas-2',
		learnerId: 'learner-1',
		name: 'Playtime Expressions',
		createdAt: 1700086400000,
		blocks: [
			{ id: 'b3', type: 'script', content: 'I want to play blocks', x: 20, y: 20 },
		],
	},
]

describe('CanvasCarousel Component', () => {
	describe('Empty State', () => {
		it('renders empty prompt when no canvases exist', () => {
			const onCreateNew = cy.stub()
			cy.mount(
				<CanvasCarousel
					canvases={[]}
					onSelectCanvas={cy.stub()}
					onCreateNew={onCreateNew}
				/>,
			)

			cy.getByName('canvas-empty-prompt').should('be.visible')
			cy.contains('No Canvases Yet!').should('be.visible')
			cy.getByName('create-canvas-btn')
				.should('be.visible')
				.and('contain.text', 'Create First Canvas')
		})

		it('calls onCreateNew when create button is clicked in empty state', () => {
			const onCreateNew = cy.stub()
			cy.mount(
				<CanvasCarousel
					canvases={[]}
					onSelectCanvas={cy.stub()}
					onCreateNew={onCreateNew}
				/>,
			)

			cy.getByName('create-canvas-btn').click()
			cy.wrap(onCreateNew).should('have.been.calledOnce')
		})
	})

	describe('Populated State & Persistent Space Layout', () => {
		it('renders top carousel container alongside persistent canvas workspace cards', () => {
			cy.mount(
				<CanvasCarousel
					canvases={mockCanvases}
					onSelectCanvas={cy.stub()}
					onCreateNew={cy.stub()}
				/>,
			)

			cy.getByName('canvas-carousel').should('be.visible')
			cy.getByName('canvas-card').should('have.length', 2)
		})

		it('displays active canvas card selection with active visual styling', () => {
			cy.mount(
				<CanvasCarousel
					canvases={mockCanvases}
					activeCanvasId="canvas-1"
					selectedCanvasId="canvas-1"
					onSelectCanvas={cy.stub()}
					onCreateNew={cy.stub()}
				/>,
			)

			cy.getByName('canvas-card').eq(0).should('have.class', 'border-brand')

			cy.getByName('canvas-card')
				.eq(1)
				.should('not.have.class', 'border-brand')
		})

		it('displays canvas title and block count in card', () => {
			cy.mount(
				<CanvasCarousel
					canvases={mockCanvases}
					onSelectCanvas={cy.stub()}
					onCreateNew={cy.stub()}
				/>,
			)

			cy.getByName('canvas-card').eq(0).within(() => {
				cy.contains('Morning Routine Canvas').should('be.visible')
				cy.contains('2 blocks').should('be.visible')
			})

			cy.getByName('canvas-card').eq(1).within(() => {
				cy.contains('Playtime Expressions').should('be.visible')
				cy.contains('1 block').should('be.visible')
			})
		})

		it('invokes onSelectCanvas when a canvas card is clicked', () => {
			const onSelectCanvas = cy.stub()
			cy.mount(
				<CanvasCarousel
					canvases={mockCanvases}
					onSelectCanvas={onSelectCanvas}
					onCreateNew={cy.stub()}
				/>,
			)

			cy.getByName('canvas-card').eq(0).click()
			cy.wrap(onSelectCanvas).should('have.been.calledWith', mockCanvases[0])
		})

		it('renders activity block thumbnail preview with image when canvas contains activity block', () => {
			const canvasWithActivity: Canvas[] = [
				{
					_id: 'canvas-act-1',
					learnerId: 'learner-1',
					name: 'Activity Canvas',
					createdAt: 1700000000000,
					blocks: [
						{
							id: 'b-act',
							type: 'activity',
							content: 'Breakfast',
							imageUrl: 'https://example.com/breakfast.png',
							x: 0,
							y: 0,
						},
					],
				},
			]

			cy.mount(
				<CanvasCarousel
					canvases={canvasWithActivity}
					onSelectCanvas={cy.stub()}
					onCreateNew={cy.stub()}
				/>,
			)

			cy.getByName('canvas-card').within(() => {
				cy.get('img[data-name="activity-preview-image"]')
					.should('be.visible')
					.and('have.attr', 'src', 'https://example.com/breakfast.png')
			})
		})

		it('constrains preview height on tablet viewport even with large images', () => {
			cy.viewport(768, 1024) // iPad / Tablet viewport

			const canvasWithLargeImage: Canvas[] = [
				{
					_id: 'canvas-img-1',
					learnerId: 'learner-1',
					name: 'Single Image Canvas',
					createdAt: 1700000000000,
					blocks: [
						{
							id: 'b-img',
							type: 'activity',
							content: 'Big Photo',
							imageUrl: 'https://example.com/big.png',
							x: 0,
							y: 0,
						},
					],
				},
				{
					_id: 'canvas-multi-1',
					learnerId: 'learner-1',
					name: 'Multi Block Canvas',
					createdAt: 1700000000000,
					blocks: [
						{ id: 'b1', type: 'emoji', content: '🎈', x: 0, y: 0 },
						{ id: 'b2', type: 'letter', content: 'B', x: 20, y: 20 },
						{ id: 'b3', type: 'number', content: '3', x: 40, y: 40 },
					],
				},
			]

			cy.mount(
				<CanvasCarousel
					canvases={canvasWithLargeImage}
					onSelectCanvas={cy.stub()}
					onCreateNew={cy.stub()}
				/>,
			)

			// The preview cards should have responsive basis classes matching boards carousel
			cy.getByName('canvas-card').each($card => {
				// Height should remain tightly constrained (< 220px total card height)
				expect($card.height()).to.be.lessThan(220)
			})
		})

		it('calls onDeleteCanvas when delete button is clicked', () => {
			const onDeleteCanvas = cy.stub()
			cy.mount(
				<CanvasCarousel
					canvases={mockCanvases}
					onSelectCanvas={cy.stub()}
					onCreateNew={cy.stub()}
					onDeleteCanvas={onDeleteCanvas}
				/>,
			)

			cy.getByName('delete-canvas-btn').eq(0).click()
			cy.wrap(onDeleteCanvas).should('have.been.calledWith', 'canvas-1')
		})
	})
})
