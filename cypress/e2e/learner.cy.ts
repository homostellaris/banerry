describe('Learner access', () => {
	it('shows the passphrase entry page', () => {
		cy.visit('/learner')
		cy.contains('Welcome to Banerry').should('be.visible')
		cy.getByName('passphrase-input').should('be.visible')
		cy.getByName('access-scripts-button').should('be.visible')
	})

	it('shows error for invalid passphrase', () => {
		cy.visit('/learner')
		cy.getByName('passphrase-input').type('invalid-fake-code')
		cy.getByName('access-scripts-button').click()
		cy.contains('Invalid access code', { timeout: 10000 }).should('be.visible')
	})

	it('redirects to scripts page with valid passphrase', () => {
		const testEmail = 'cypress-learner-access@banerry.app'
		const learnerName = `Access Learner ${Date.now()}`

		cy.signIn(testEmail)
		cy.createLearner(learnerName)

		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.contains('Learner Passphrase').should('be.visible')
		cy.get('code')
			.first()
			.invoke('text')
			.then(passphrase => {
				cy.clearAllCookies()
				cy.clearAllLocalStorage()
				cy.clearAllSessionStorage()

				cy.visit('/learner')
				cy.getByName('passphrase-input').type(passphrase.trim())
				cy.getByName('access-scripts-button').click()

				cy.url({ timeout: 10000 }).should(
					'include',
					`/learner/${passphrase.trim()}`,
				)
			})
	})
})
