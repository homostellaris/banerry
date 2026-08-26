import React from 'react'
import { CanvasEditor } from '@/app/_canvas/canvas-editor'
import type { Canvas } from '@/app/_canvas/types'

const mockCanvas: Canvas = {
	_id: 'canvas-101',
	learnerId: 'learner-1',
	name: 'My Custom Canvas',
	createdAt: Date.now(),
	blocks: [
		{ id: 'b1', type: 'emoji', content: '🌟', x: 60, y: 100 },
		{ id: 'b2', type: 'letter', content: 'STAR', x: 200, y: 100 },
	],
}

describe('CanvasEditor Component - Read Mode vs Edit Mode', () => {
	it('renders Read Mode view with title, toggle button, and hides edit-only controls', () => {
		cy.mount(
			<CanvasEditor
				canvas={mockCanvas}
				passphrase="test-passphrase"
				isEditingMode={false}
			/>,
		)

		cy.getByName('canvas-editor').should('be.visible')
		cy.getByName('canvas-read-mode').should('be.visible')
		cy.getByName('canvas-title')
			.should('be.visible')
			.and('contain.text', 'My Custom Canvas')
		cy.getByName('toggle-edit-mode-btn')
			.should('be.visible')
			.and('contain.text', 'Edit')

		// Edit-only controls hidden in Read Mode
		cy.getByName('block-palette').should('not.exist')
		cy.getByName('delete-canvas-btn').should('not.exist')
		cy.get('input[placeholder="Canvas Title"]').should('not.exist')
	})

	it('renders Edit Mode view with Done button, title heading, delete button, and block palette', () => {
		cy.mount(
			<CanvasEditor
				canvas={mockCanvas}
				passphrase="test-passphrase"
				isEditingMode={true}
			/>,
		)

		cy.getByName('canvas-editor').should('be.visible')
		cy.getByName('canvas-edit-mode').should('be.visible')
		cy.getByName('canvas-title')
			.should('be.visible')
			.and('contain.text', 'My Custom Canvas')
		cy.getByName('toggle-edit-mode-btn')
			.should('be.visible')
			.and('contain.text', 'Done')

		cy.getByName('block-palette').should('be.visible')
		cy.getByName('delete-canvas-btn').should('be.visible')
	})

	it('triggers onToggleEditMode callback when toggle button is clicked', () => {
		const onToggleEditMode = cy.stub()
		cy.mount(
			<CanvasEditor
				canvas={mockCanvas}
				passphrase="test-passphrase"
				isEditingMode={false}
				onToggleEditMode={onToggleEditMode}
			/>,
		)

		cy.getByName('toggle-edit-mode-btn').click()
		cy.wrap(onToggleEditMode).should('have.been.calledOnce')
	})

	it('renders live auto-save indicator with data-name="auto-save-indicator"', () => {
		cy.mount(
			<CanvasEditor
				canvas={mockCanvas}
				passphrase="test-passphrase"
				isEditingMode={true}
				isAutoSaving={true}
			/>,
		)

		cy.getByName('auto-save-indicator')
			.should('be.visible')
			.and('contain.text', 'Saving')
	})

	it('supports seamless live workspace persistence without manual save button requirement via onAutoSave', () => {
		const onAutoSave = cy.stub()
		cy.mount(
			<CanvasEditor
				canvas={mockCanvas}
				passphrase="test-passphrase"
				isEditingMode={true}
				onAutoSave={onAutoSave}
				autoSaveDelayMs={100}
			/>,
		)

		cy.getByName('block-palette').within(() => {
			cy.contains('Emoji').click()
		})
		cy.getByName('emoji-picker-modal').should('be.visible')
		cy.getByName('emoji-item-option').first().click()

		cy.wait(300)
		cy.wrap(onAutoSave).should('have.been.called')
	})

	it('adds a new block when selecting a type from the palette in Edit Mode', () => {
		cy.mount(
			<CanvasEditor
				canvas={mockCanvas}
				passphrase="test-passphrase"
				isEditingMode={true}
			/>,
		)

		cy.getByName('canvas-block-emoji').should('have.length', 1)

		cy.getByName('block-palette').within(() => {
			cy.contains('Emoji').click()
		})
		cy.getByName('emoji-picker-modal').should('be.visible')
		cy.getByName('emoji-item-option').first().click()

		cy.getByName('canvas-block-emoji').should('have.length', 2)
	})
})
