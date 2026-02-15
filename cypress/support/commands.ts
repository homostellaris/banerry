/// <reference types="cypress" />

Cypress.Commands.add('signIn', (email: string) => {
	const otp = Cypress.env('OTP_OVERRIDE')
	if (!otp) {
		throw new Error('CYPRESS_OTP_OVERRIDE env var must be set')
	}

	cy.session(
		email,
		() => {
			cy.request('POST', '/api/auth', {
				action: 'auth:signIn',
				args: { provider: 'resend-otp', params: { email } },
			})

			cy.request('POST', '/api/auth', {
				action: 'auth:signIn',
				args: { provider: 'resend-otp', params: { email, code: otp } },
			})
		},
		{
			validate() {
				cy.visit('/mentor')
				cy.url().should('include', '/mentor')
			},
		},
	)

	Cypress.env('CURRENT_TEST_EMAIL', email)
})

Cypress.Commands.add('createLearner', (name: string, bio?: string) => {
	const email = Cypress.env('CURRENT_TEST_EMAIL')
	if (!email) {
		throw new Error(
			'CURRENT_TEST_EMAIL not set — call cy.signIn() before cy.createLearner()',
		)
	}

	cy.task('createTestLearner', { email, name, bio })
})

Cypress.Commands.add('getByName', (name: string) => {
	return cy.get(`[data-name="${name}"]`)
})

export {}
