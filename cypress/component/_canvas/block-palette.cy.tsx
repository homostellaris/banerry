import React from 'react'
import { BlockPalette } from '@/app/_canvas/block-palette'

describe('BlockPalette Component', () => {
	it('renders block palette container and header', () => {
		cy.mount(
			<BlockPalette
				onSelectBlockType={cy.stub()}
			/>,
		)

		cy.getByName('block-palette').should('be.visible')
		cy.contains('Add Block to Canvas').should('be.visible')
	})

	it('renders block type options with labels and icons', () => {
		cy.mount(
			<BlockPalette
				onSelectBlockType={cy.stub()}
			/>,
		)

		cy.contains('Script').should('be.visible')
		cy.contains('Activity').should('be.visible')
		cy.contains('Emoji').should('be.visible')
		cy.contains('Letter').should('be.visible')
		cy.contains('Number').should('be.visible')
	})

	it('displays script and activity counts when provided', () => {
		const mockScripts = [
			{ _id: 's1', dialogue: 'Hello' },
			{ _id: 's2', dialogue: 'Goodbye' },
		]
		const mockColumns = [
			{ id: 'c1', title: 'Brush Teeth' },
		]

		cy.mount(
			<BlockPalette
				onSelectBlockType={cy.stub()}
				scripts={mockScripts}
				activeBoardColumns={mockColumns}
			/>,
		)

		cy.contains('Script (2)').should('be.visible')
		cy.contains('Activity (1)').should('be.visible')
	})

	it('triggers onSelectBlockType with correct type on click', () => {
		const onSelectBlockType = cy.stub()
		cy.mount(
			<BlockPalette
				onSelectBlockType={onSelectBlockType}
			/>,
		)

		cy.contains('Emoji').click()
		cy.wrap(onSelectBlockType).should('have.been.calledWith', 'emoji')

		cy.contains('Letter').click()
		cy.wrap(onSelectBlockType).should('have.been.calledWith', 'letter')

		cy.contains('Number').click()
		cy.wrap(onSelectBlockType).should('have.been.calledWith', 'number')
	})
})
