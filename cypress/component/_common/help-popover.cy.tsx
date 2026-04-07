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
		.and('have.attr', 'href', 'mailto:hello@banerry.app')
})

it('shows feedback button', () => {
	mountHelpPopover()
	cy.get('[data-name="help-popover-trigger"]').click()
	cy.getByName('feedback-button').should('be.visible').and('contain.text', 'Feedback')
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
