/// <reference types="cypress" />

Cypress.Commands.add('signIn', (email: string) => {
	const otp = Cypress.env('OTP_OVERRIDE')
	if (!otp) {
		throw new Error('CYPRESS_OTP_OVERRIDE env var must be set')
	}

	cy.session(
		email,
		() => {
			cy.visit('/signin')
			cy.getByName('email-input').type(email)
			cy.getByName('send-code-button').click()

			cy.getByName('otp-input').should('be.visible').type(otp)
			cy.getByName('verify-button').click()

			cy.url({ timeout: 10000 }).should('include', '/mentor')
		},
		{
			validate() {
				cy.visit('/mentor')
				cy.url().should('include', '/mentor')
			},
		},
	)
})

Cypress.Commands.add('createLearner', (name: string, bio?: string) => {
	cy.visit('/mentor')
	cy.getByName('add-learner-button').click()
	cy.getByName('learner-name-input').type(name)
	if (bio) {
		cy.getByName('learner-bio-input').type(bio)
	}
	cy.getByName('create-learner-submit').click()

	cy.contains(name, { timeout: 10000 }).should('be.visible')
})

Cypress.Commands.add('getByName', (name: string) => {
	return cy.get(`[data-name="${name}"]`)
})

export {}
