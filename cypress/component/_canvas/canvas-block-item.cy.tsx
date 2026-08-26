import React from 'react'
import { CanvasBlockItem } from '@/app/_canvas/canvas-block-item'
import type { CanvasBlock } from '@/app/_canvas/types'

const mockBlock: CanvasBlock = {
	id: 'block-99',
	type: 'emoji',
	content: '🎨',
	x: 0,
	y: 0,
}

describe('CanvasBlockItem Component - Read Mode vs Edit Mode & Responsive Controls', () => {
	it('renders with data-name based on block type and displays content', () => {
		cy.mount(<CanvasBlockItem block={mockBlock} />)

		cy.getByName('canvas-block-emoji').should('be.visible')
		cy.contains('🎨').should('be.visible')
	})

	describe('Read Mode (`isEditingMode={false}`)', () => {
		it('renders clean speech audio button data-name="block-speech-btn" and hides edit/delete/reorder controls', () => {
			cy.mount(
				<CanvasBlockItem
					block={mockBlock}
					isEditingMode={false}
				/>,
			)

			cy.getByName('canvas-block-emoji').should('be.visible')
			cy.getByName('block-speech-btn').should('be.visible')

			// Edit, delete, and reorder controls hidden in Read Mode
			cy.getByName('edit-block-btn').should('not.exist')
			cy.getByName('delete-block-btn').should('not.exist')
			cy.getByName('move-up-btn').should('not.exist')
			cy.getByName('move-down-btn').should('not.exist')
			cy.getByName('move-left-btn').should('not.exist')
			cy.getByName('move-right-btn').should('not.exist')
		})
	})

	describe('Edit Mode (`isEditingMode={true}`)', () => {
		it('renders edit-block-btn, delete-block-btn, and hides clean speech button', () => {
			const onChangeScriptOrActivity = cy.stub()
			const onDelete = cy.stub()

			cy.mount(
				<CanvasBlockItem
					block={mockBlock}
					isEditingMode={true}
					isSelected={true}
					onChangeScriptOrActivity={onChangeScriptOrActivity}
					onDelete={onDelete}
				/>,
			)

			cy.getByName('edit-block-btn').should('be.visible').click()
			cy.wrap(onChangeScriptOrActivity).should('have.been.calledWith', mockBlock)

			cy.getByName('delete-block-btn').should('be.visible').click()
			cy.wrap(onDelete).should('have.been.calledWith', 'block-99')

			cy.getByName('block-speech-btn').should('not.exist')
		})

		it('renders vertical up/down rearrange controls on small viewports (mobile)', () => {
			cy.mount(
				<CanvasBlockItem
					block={mockBlock}
					isEditingMode={true}
					isSelected={true}
					index={1}
					totalBlocks={3}
					onMoveLeft={cy.stub()}
					onMoveRight={cy.stub()}
				/>,
			)

			cy.getByName('move-up-btn').should('exist').and('have.class', 'sm:hidden')
			cy.getByName('move-down-btn').should('exist').and('have.class', 'sm:hidden')
		})

		it('renders horizontal left/right rearrange controls on large viewports (desktop)', () => {
			cy.mount(
				<CanvasBlockItem
					block={mockBlock}
					isEditingMode={true}
					isSelected={true}
					index={1}
					totalBlocks={3}
					onMoveLeft={cy.stub()}
					onMoveRight={cy.stub()}
				/>,
			)

			cy.getByName('move-left-btn').should('exist').and('have.class', 'hidden')
			cy.getByName('move-right-btn').should('exist').and('have.class', 'hidden')
		})
	})

	it('applies selection ring styles when isSelected is true', () => {
		cy.mount(<CanvasBlockItem block={mockBlock} isSelected={true} />)

		cy.getByName('canvas-block-emoji').should('have.class', 'ring-brand')
	})

	it('renders non-overflowing activity image container with data-name="activity-block-image"', () => {
		const activityBlockWithImage: CanvasBlock = {
			id: 'act-img-1',
			type: 'activity',
			content: 'Brush Teeth',
			imageUrl: 'https://example.com/toothbrush.png',
			x: 0,
			y: 0,
		}

		cy.mount(<CanvasBlockItem block={activityBlockWithImage} />)

		cy.getByName('canvas-block-activity').should('be.visible')
		cy.getByName('activity-block-image')
			.should('be.visible')
			.and('have.attr', 'src', 'https://example.com/toothbrush.png')
	})

	it('renders script block matching scripts page with prominent dialogue text', () => {
		const scriptBlock: CanvasBlock = {
			id: 'script-blk-1',
			type: 'script',
			content: 'I want water please',
			x: 0,
			y: 0,
		}

		cy.mount(<CanvasBlockItem block={scriptBlock} />)

		cy.getByName('canvas-block-script').should('be.visible')
		cy.getByName('canvas-block-script').within(() => {
			cy.contains('I want water please').should('be.visible')
		})
	})

	it('renders accessible large touch targets for edit and delete buttons in edit mode', () => {
		cy.mount(
			<CanvasBlockItem
				block={mockBlock}
				isEditingMode={true}
				onChangeScriptOrActivity={cy.stub()}
				onDelete={cy.stub()}
			/>,
		)

		cy.getByName('edit-block-btn')
			.should('be.visible')
			.and('contain.text', 'Change')
		cy.getByName('delete-block-btn')
			.should('be.visible')
			.and('contain.text', 'Delete')
	})

	it('triggers onTap callback when clicked', () => {
		const onTap = cy.stub().as('onTapStub')
		cy.mount(<CanvasBlockItem block={mockBlock} onTap={onTap} />)

		cy.contains('🎨').click()
		cy.get('@onTapStub').should('have.been.calledWith', mockBlock)
	})
})
