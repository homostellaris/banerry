describe('Sign-in flow', () => {
	beforeEach(() => {
		cy.clearAllCookies()
		cy.clearAllLocalStorage()
		cy.clearAllSessionStorage()
	})

	it('shows the sign-in form with email input and send code button', () => {
		cy.visit('/signin')
		cy.getByName('email-input').should('be.visible')
		cy.getByName('send-code-button')
			.should('be.visible')
			.and('contain', 'Send code')
	})

	it('completes the OTP flow and redirects to /mentor', () => {
		cy.signIn('cypress-test@banerry.app')
		cy.visit('/mentor')
		cy.url().should('include', '/mentor')
		cy.contains('Learners').should('be.visible')
	})

	it('shows the OTP modal after requesting a code', () => {
		cy.visit('/signin')
		cy.getByName('email-input').type('cypress-test@banerry.app')
		cy.getByName('send-code-button').click()
		cy.getByName('otp-input').should('be.visible')
		cy.getByName('verify-button').should('be.visible')
		cy.contains('Enter verification code').should('be.visible')
	})

	it('redirects unauthenticated users to /signin', () => {
		cy.visit('/mentor')
		cy.url().should('include', '/signin')
	})
})
