import React from 'react'
import { LetterPickerModal } from '@/app/_canvas/letter-picker-modal'
import { LETTER_OPTIONS } from '@/app/_canvas/types'

describe('LetterPickerModal Component', () => {
	it('does not render when isOpen is false', () => {
		cy.mount(
			<LetterPickerModal
				isOpen={false}
				onSelectLetter={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('letter-picker-modal').should('not.exist')
	})

	it('renders modal container with data-name attribute when isOpen is true', () => {
		cy.mount(
			<LetterPickerModal
				isOpen={true}
				onSelectLetter={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('letter-picker-modal').should('be.visible')
		cy.contains('Select Letter').should('be.visible')
	})

	it('renders preset letter options with data-name="letter-item-option"', () => {
		cy.mount(
			<LetterPickerModal
				isOpen={true}
				onSelectLetter={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('letter-item-option').should('have.length', LETTER_OPTIONS.length)
		cy.getByName('letter-item-option').first().should('contain', LETTER_OPTIONS[0])
	})

	it('highlights selected letter matching selectedLetter prop', () => {
		const selected = 'B'
		cy.mount(
			<LetterPickerModal
				isOpen={true}
				selectedLetter={selected}
				onSelectLetter={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.contains('button[data-name="letter-item-option"]', selected)
			.should('have.class', 'border-purple-500')
			.and('have.class', 'bg-purple-50')
	})

	it('invokes onSelectLetter and onClose callbacks when a letter is clicked', () => {
		const onSelectLetter = cy.stub()
		const onClose = cy.stub()

		cy.mount(
			<LetterPickerModal
				isOpen={true}
				onSelectLetter={onSelectLetter}
				onClose={onClose}
			/>,
		)

		const targetLetter = LETTER_OPTIONS[0] // 'A'
		cy.getByName('letter-item-option').first().click()
		cy.wrap(onSelectLetter).should('have.been.calledOnceWith', targetLetter)
		cy.wrap(onClose).should('have.been.calledOnce')
	})

	it('invokes onClose when close button is clicked', () => {
		const onClose = cy.stub()

		cy.mount(
			<LetterPickerModal
				isOpen={true}
				onSelectLetter={cy.stub()}
				onClose={onClose}
			/>,
		)

		cy.contains('button', '×').click()
		cy.wrap(onClose).should('have.been.calledOnce')
	})

	it('invokes onClose when clicking modal backdrop overlay', () => {
		const onClose = cy.stub()

		cy.mount(
			<LetterPickerModal
				isOpen={true}
				onSelectLetter={cy.stub()}
				onClose={onClose}
			/>,
		)

		cy.getByName('letter-picker-modal').click('topLeft', { force: true })
		cy.wrap(onClose).should('have.been.calledOnce')
	})
})
