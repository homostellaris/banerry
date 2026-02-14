describe('Learner management', () => {
	const testEmail = 'cypress-learner-mgmt@banerry.app'

	beforeEach(() => {
		cy.signIn(testEmail)
		cy.visit('/mentor')
	})

	it('displays the mentor page with learner list', () => {
		cy.contains('Learners').should('be.visible')
		cy.getByName('add-learner-button').should('be.visible')
	})

	it('creates a new learner', () => {
		const learnerName = `Test Learner ${Date.now()}`
		cy.createLearner(learnerName)
		cy.contains(learnerName).should('be.visible')
	})

	it('creates a learner with a bio', () => {
		const learnerName = `Bio Learner ${Date.now()}`
		cy.createLearner(learnerName, 'Likes dinosaurs and trains')
		cy.contains(learnerName).should('be.visible')
	})

	it('navigates to learner detail page', () => {
		const learnerName = `Nav Learner ${Date.now()}`
		cy.createLearner(learnerName)
		cy.getByName('learner-card').contains(learnerName).click()
		cy.contains(learnerName).should('be.visible')
		cy.getByName('delete-learner-button').should('be.visible')
	})

	it('deletes a learner', () => {
		const learnerName = `Delete Learner ${Date.now()}`
		cy.createLearner(learnerName)
		cy.getByName('learner-card').contains(learnerName).click()
		cy.getByName('delete-learner-button').click()
		cy.getByName('confirm-delete-learner').click()
		cy.url().should('include', '/mentor')
		cy.contains(learnerName).should('not.exist')
	})
})
