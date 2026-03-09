describe('Timer page', () => {
	const testEmail = 'cypress-timer@banerry.app'
	let learnerName: string
	let learnerId: string

	before(() => {
		learnerName = `Timer Learner ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)

		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.url()
			.should('include', '/mentor/learner/')
			.then(url => {
				learnerId = url.split('/mentor/learner/')[1].split('/')[0]
			})
	})

	it('navigates to the timer page and renders the component', () => {
		cy.signIn(testEmail)
		cy.visit(`/mentor/learner/${learnerId}/timer`)
		cy.contains('Set Timer').should('be.visible')
		cy.contains('Quick Timers').should('be.visible')
		cy.contains('Start').should('be.visible')
	})
})
