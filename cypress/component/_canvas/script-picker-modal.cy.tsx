import React from 'react'
import { ScriptPickerModal } from '@/app/_canvas/script-picker-modal'
import type { ScriptItem } from '@/app/_canvas/types'

const mockScripts: ScriptItem[] = [
	{ _id: 'script-1', dialogue: 'I want apple juice', parentheticals: 'pointing to fridge' },
	{ _id: 'script-2', dialogue: 'Time for break', parentheticals: 'quiet voice' },
	{ _id: 'script-3', dialogue: 'Help me please' },
]

describe('ScriptPickerModal Component', () => {
	it('does not render when isOpen is false', () => {
		cy.mount(
			<ScriptPickerModal
				isOpen={false}
				scripts={mockScripts}
				onSelectScript={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('script-picker-modal').should('not.exist')
	})

	it('renders modal container with data-name attribute when isOpen is true', () => {
		cy.mount(
			<ScriptPickerModal
				isOpen={true}
				scripts={mockScripts}
				onSelectScript={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('script-picker-modal').should('be.visible')
		cy.contains('Select Script').should('be.visible')
	})

	it('renders script items with dialogue, parentheticals, and data-name attributes', () => {
		cy.mount(
			<ScriptPickerModal
				isOpen={true}
				scripts={mockScripts}
				onSelectScript={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('script-item-option').should('have.length', 3)
		cy.contains('"I want apple juice"').should('be.visible')
		cy.contains('(pointing to fridge)').should('be.visible')
		cy.contains('"Time for break"').should('be.visible')
		cy.contains('(quiet voice)').should('be.visible')
		cy.contains('"Help me please"').should('be.visible')
	})

	it('highlights selected script option matching selectedScriptId', () => {
		cy.mount(
			<ScriptPickerModal
				isOpen={true}
				scripts={mockScripts}
				selectedScriptId="script-2"
				onSelectScript={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('script-item-option')
			.eq(1)
			.should('have.class', 'border-blue-500')
			.and('have.class', 'bg-blue-50')
	})

	it('displays fallback options when no custom scripts are provided', () => {
		cy.mount(
			<ScriptPickerModal
				isOpen={true}
				scripts={[]}
				onSelectScript={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.contains('I want to play').should('be.visible')
		cy.getByName('script-item-option').should('have.length', 3)
	})

	it('invokes onSelectScript and onClose callbacks when a script option is clicked', () => {
		const onSelectScript = cy.stub()
		const onClose = cy.stub()

		cy.mount(
			<ScriptPickerModal
				isOpen={true}
				scripts={mockScripts}
				onSelectScript={onSelectScript}
				onClose={onClose}
			/>,
		)

		cy.getByName('script-item-option').eq(0).click()
		cy.wrap(onSelectScript).should('have.been.calledOnceWith', mockScripts[0])
		cy.wrap(onClose).should('have.been.calledOnce')
	})

	it('invokes onClose when the close button is clicked', () => {
		const onClose = cy.stub()

		cy.mount(
			<ScriptPickerModal
				isOpen={true}
				scripts={mockScripts}
				onSelectScript={cy.stub()}
				onClose={onClose}
			/>,
		)

		cy.contains('button', '×').click()
		cy.wrap(onClose).should('have.been.calledOnce')
	})

	it('renders filtered list of scripts when search/filtered dataset is provided', () => {
		const filteredScripts = mockScripts.filter(s => s.dialogue.includes('apple'))
		cy.mount(
			<ScriptPickerModal
				isOpen={true}
				scripts={filteredScripts}
				onSelectScript={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('script-item-option').should('have.length', 1)
		cy.contains('"I want apple juice"').should('be.visible')
	})
})
