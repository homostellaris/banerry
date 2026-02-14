describe('Timer page', () => {
	const testEmail = 'cypress-timer@banerry.app'
	let learnerName: string

	before(() => {
		learnerName = `Timer Learner ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)
	})

	it('navigates to the timer page and renders the component', () => {
		cy.signIn(testEmail)
		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.get('a[href*="/timer"]').click()
		cy.url().should('include', '/timer')
		cy.contains('Set Timer').should('be.visible')
		cy.contains('Quick Timers').should('be.visible')
		cy.contains('Start').should('be.visible')
	})
})
