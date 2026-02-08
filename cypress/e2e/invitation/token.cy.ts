describe('Invitation page', () => {
	beforeEach(() => {
		cy.clearAllCookies()
		cy.clearAllLocalStorage()
		cy.clearAllSessionStorage()
	})

	it('shows invalid invitation state for a bad token', () => {
		cy.visit('/invitation/clearly-invalid-token-999999', {
			failOnStatusCode: false,
		})

		cy.contains('Invalid Invitation', { timeout: 10000 }).should('be.visible')
		cy.contains('Go to Sign In').should('be.visible')
	})

	it('navigates to signin when clicking Go to Sign In', () => {
		cy.visit('/invitation/invalid-token-999', { failOnStatusCode: false })

		cy.contains('Go to Sign In', { timeout: 10000 }).click()
		cy.url().should('include', '/signin')
	})

	it('shows loading state initially', () => {
		cy.visit('/invitation/test-token', { failOnStatusCode: false })
		cy.contains('Loading invitation').should('exist')
	})
})
