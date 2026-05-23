describe('Learner board view', () => {
	const testEmail = 'cypress-learner-boards@banerry.app'
	let passphrase: string

	before(() => {
		cy.signIn(testEmail)
		cy.task('createTestLearner', {
			email: testEmail,
			name: `Learner Boards ${Date.now()}`,
		}).then(({ passphrase: p }: { passphrase: string }) => {
			passphrase = p
		})
	})

	beforeEach(() => {
		cy.on('uncaught:exception', error => {
			if (error.message.includes('Unauthenticated')) return false
		})
		cy.clearAllCookies()
		cy.clearAllLocalStorage()
		cy.clearAllSessionStorage()
	})

	it('does not show the batch prompt input on the learner boards page', () => {
		cy.visit(`/learner/${passphrase}/boards`)
		cy.getByName('batch-prompt-input').should('not.exist')
	})
})
