import React from 'react'
import { NumberPickerModal } from '@/app/_canvas/number-picker-modal'
import { NUMBER_OPTIONS } from '@/app/_canvas/types'

describe('NumberPickerModal Component', () => {
	it('does not render when isOpen is false', () => {
		cy.mount(
			<NumberPickerModal
				isOpen={false}
				onSelectNumber={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('number-picker-modal').should('not.exist')
	})

	it('renders modal container with data-name attribute when isOpen is true', () => {
		cy.mount(
			<NumberPickerModal
				isOpen={true}
				onSelectNumber={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('number-picker-modal').should('be.visible')
		cy.contains('Select Number').should('be.visible')
	})

	it('renders preset number options with data-name="number-item-option"', () => {
		cy.mount(
			<NumberPickerModal
				isOpen={true}
				onSelectNumber={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('number-item-option').should('have.length', NUMBER_OPTIONS.length)
		cy.getByName('number-item-option').first().should('contain', NUMBER_OPTIONS[0])
	})

	it('highlights selected number matching selectedNumber prop', () => {
		const selected = '5'
		cy.mount(
			<NumberPickerModal
				isOpen={true}
				selectedNumber={selected}
				onSelectNumber={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.contains('button[data-name="number-item-option"]', selected)
			.should('have.class', 'border-emerald-500')
			.and('have.class', 'bg-emerald-50')
	})

	it('invokes onSelectNumber and onClose callbacks when a number is clicked', () => {
		const onSelectNumber = cy.stub()
		const onClose = cy.stub()

		cy.mount(
			<NumberPickerModal
				isOpen={true}
				onSelectNumber={onSelectNumber}
				onClose={onClose}
			/>,
		)

		const targetNumber = NUMBER_OPTIONS[0] // '0'
		cy.getByName('number-item-option').first().click()
		cy.wrap(onSelectNumber).should('have.been.calledOnceWith', targetNumber)
		cy.wrap(onClose).should('have.been.calledOnce')
	})

	it('invokes onClose when close button is clicked', () => {
		const onClose = cy.stub()

		cy.mount(
			<NumberPickerModal
				isOpen={true}
				onSelectNumber={cy.stub()}
				onClose={onClose}
			/>,
		)

		cy.contains('button', '×').click()
		cy.wrap(onClose).should('have.been.calledOnce')
	})

	it('invokes onClose when clicking modal backdrop overlay', () => {
		const onClose = cy.stub()

		cy.mount(
			<NumberPickerModal
				isOpen={true}
				onSelectNumber={cy.stub()}
				onClose={onClose}
			/>,
		)

		cy.getByName('number-picker-modal').click('topLeft', { force: true })
		cy.wrap(onClose).should('have.been.calledOnce')
	})
})
