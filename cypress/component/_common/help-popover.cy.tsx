import posthog from 'posthog-js'
import HelpPopover from '@/app/_common/help-popover'

function mountHelpPopover() {
	cy.mount(<HelpPopover />)
}

it('opens the popover when help icon is clicked', () => {
	mountHelpPopover()
	cy.get('[data-name="help-popover-trigger"]').click()
	cy.getByName('help-link').should('be.visible')
})

it('shows help link', () => {
	mountHelpPopover()
	cy.get('[data-name="help-popover-trigger"]').click()
	cy.getByName('help-link')
		.should('be.visible')
		.and('contain.text', 'Help')
		.and('have.attr', 'href', 'mailto:mrdanielmetcalfe+banerry@gmail.com')
})

it('shows feedback button', () => {
	mountHelpPopover()
	cy.get('[data-name="help-popover-trigger"]').click()
	cy.getByName('feedback-button')
		.should('be.visible')
		.and('contain.text', 'Feedback')
})

it('opens the feedback survey when feedback button is clicked', () => {
	cy.stub(posthog.surveys, 'getSurveys').callsFake(
		(callback: (surveys: { id: string }[]) => void) => {
			callback([{ id: 'survey-123' }])
		},
	)
	cy.stub(posthog, 'displaySurvey')
	mountHelpPopover()
	cy.get('[data-name="help-popover-trigger"]').click()
	cy.getByName('feedback-button').click()
	cy.wrap(posthog.displaySurvey).should(
		'have.been.calledWithMatch',
		'survey-123',
	)
})

it('shows whatsapp link', () => {
	mountHelpPopover()
	cy.get('[data-name="help-popover-trigger"]').click()
	cy.getByName('whatsapp-link')
		.should('be.visible')
		.and('contain.text', 'WhatsApp')
		.and('have.attr', 'href')
		.and('include', 'chat.whatsapp.com')
})
