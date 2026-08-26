import React from 'react'
import { EmojiPickerModal } from '@/app/_canvas/emoji-picker-modal'
import { EMOJI_OPTIONS } from '@/app/_canvas/types'

describe('EmojiPickerModal Component', () => {
	it('does not render when isOpen is false', () => {
		cy.mount(
			<EmojiPickerModal
				isOpen={false}
				onSelectEmoji={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('emoji-picker-modal').should('not.exist')
	})

	it('renders modal container with data-name attribute when isOpen is true', () => {
		cy.mount(
			<EmojiPickerModal
				isOpen={true}
				onSelectEmoji={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('emoji-picker-modal').should('be.visible')
		cy.contains('Select Emoji').should('be.visible')
	})

	it('renders preset emoji options with data-name="emoji-item-option"', () => {
		cy.mount(
			<EmojiPickerModal
				isOpen={true}
				onSelectEmoji={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('emoji-item-option').should('have.length', EMOJI_OPTIONS.length)
		cy.getByName('emoji-item-option').first().should('contain', EMOJI_OPTIONS[0])
	})

	it('highlights selected emoji matching selectedEmoji prop', () => {
		const selected = EMOJI_OPTIONS[3] // '😁'
		cy.mount(
			<EmojiPickerModal
				isOpen={true}
				selectedEmoji={selected}
				onSelectEmoji={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.contains('button[data-name="emoji-item-option"]', selected)
			.should('have.class', 'border-brand')
			.and('have.class', 'bg-brand/10')
	})

	it('invokes onSelectEmoji and onClose callbacks when an emoji is clicked', () => {
		const onSelectEmoji = cy.stub()
		const onClose = cy.stub()

		cy.mount(
			<EmojiPickerModal
				isOpen={true}
				onSelectEmoji={onSelectEmoji}
				onClose={onClose}
			/>,
		)

		const targetEmoji = EMOJI_OPTIONS[0]
		cy.getByName('emoji-item-option').first().click()
		cy.wrap(onSelectEmoji).should('have.been.calledOnceWith', targetEmoji)
		cy.wrap(onClose).should('have.been.calledOnce')
	})

	it('invokes onClose when close button is clicked', () => {
		const onClose = cy.stub()

		cy.mount(
			<EmojiPickerModal
				isOpen={true}
				onSelectEmoji={cy.stub()}
				onClose={onClose}
			/>,
		)

		cy.contains('button', '×').click()
		cy.wrap(onClose).should('have.been.calledOnce')
	})

	it('invokes onClose when clicking modal backdrop overlay', () => {
		const onClose = cy.stub()

		cy.mount(
			<EmojiPickerModal
				isOpen={true}
				onSelectEmoji={cy.stub()}
				onClose={onClose}
			/>,
		)

		cy.getByName('emoji-picker-modal').click('topLeft', { force: true })
		cy.wrap(onClose).should('have.been.calledOnce')
	})
})
