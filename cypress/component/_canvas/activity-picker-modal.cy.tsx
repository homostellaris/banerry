import React from 'react'
import { ActivityPickerModal } from '@/app/_canvas/activity-picker-modal'
import type { ActivityItem } from '@/app/_canvas/types'

const mockActivities: ActivityItem[] = [
	{ id: 'act-1', title: 'Brush Teeth', imagePrompt: 'tooth brush' },
	{ id: 'act-2', title: 'Wash Hands' },
	{ id: 'act-3', title: 'Pack Backpack' },
]

describe('ActivityPickerModal Component', () => {
	it('does not render when isOpen is false', () => {
		cy.mount(
			<ActivityPickerModal
				isOpen={false}
				activities={mockActivities}
				onSelectActivity={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('activity-picker-modal').should('not.exist')
	})

	it('renders modal container with data-name attribute when isOpen is true', () => {
		cy.mount(
			<ActivityPickerModal
				isOpen={true}
				activities={mockActivities}
				onSelectActivity={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('activity-picker-modal').should('be.visible')
		cy.contains('Select Activity').should('be.visible')
	})

	it('renders activity column options with titles, icons, and data-name attributes', () => {
		cy.mount(
			<ActivityPickerModal
				isOpen={true}
				activities={mockActivities}
				onSelectActivity={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('activity-item-option').should('have.length', 3)
		cy.contains('Brush Teeth').should('be.visible')
		cy.contains('Wash Hands').should('be.visible')
		cy.contains('Pack Backpack').should('be.visible')
	})

	it('highlights selected activity option matching selectedActivityId', () => {
		cy.mount(
			<ActivityPickerModal
				isOpen={true}
				activities={mockActivities}
				selectedActivityId="act-2"
				onSelectActivity={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('activity-item-option')
			.eq(1)
			.should('have.class', 'border-emerald-500')
			.and('have.class', 'bg-emerald-50')
	})

	it('displays fallback options when no active board columns are provided', () => {
		cy.mount(
			<ActivityPickerModal
				isOpen={true}
				activities={[]}
				onSelectActivity={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.contains('Brush Teeth').should('be.visible')
		cy.getByName('activity-item-option').should('have.length', 3)
	})

	it('invokes onSelectActivity and onClose callbacks when an activity is selected', () => {
		const onSelectActivity = cy.stub()
		const onClose = cy.stub()

		cy.mount(
			<ActivityPickerModal
				isOpen={true}
				activities={mockActivities}
				onSelectActivity={onSelectActivity}
				onClose={onClose}
			/>,
		)

		cy.getByName('activity-item-option').eq(0).click()
		cy.wrap(onSelectActivity).should('have.been.calledOnceWith', mockActivities[0])
		cy.wrap(onClose).should('have.been.calledOnce')
	})

	it('invokes onClose when the close button is clicked', () => {
		const onClose = cy.stub()

		cy.mount(
			<ActivityPickerModal
				isOpen={true}
				activities={mockActivities}
				onSelectActivity={cy.stub()}
				onClose={onClose}
			/>,
		)

		cy.contains('button', '×').click()
		cy.wrap(onClose).should('have.been.calledOnce')
	})

	it('renders filtered list of activities when search/filtered dataset is provided', () => {
		const filteredActivities = mockActivities.filter(a => a.title.includes('Wash'))
		cy.mount(
			<ActivityPickerModal
				isOpen={true}
				activities={filteredActivities}
				onSelectActivity={cy.stub()}
				onClose={cy.stub()}
			/>,
		)
		cy.getByName('activity-item-option').should('have.length', 1)
		cy.contains('Wash Hands').should('be.visible')
	})
})
