describe('Learner board view', () => {
	const testEmail = 'cypress-learner-boards@banerry.app'
	let passphrase: string
	let learnerName: string

	before(() => {
		learnerName = `Learner Boards ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)

		cy.visit('/mentor')
		cy.contains('[data-name="learner-card"]', learnerName)
			.find('[data-name="learner-card-menu"]')
			.click()
		cy.getByName('learner-card-edit').click()
		cy.getByName('learner-passphrase')
			.should('not.be.empty')
			.invoke('text')
			.then(text => {
				passphrase = text.trim()
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
