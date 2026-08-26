describe('Mentor Canvas view', () => {
	const testEmail = 'cypress-mentor-canvas@banerry.app'
	let learnerName: string
	let learnerId: string

	before(() => {
		learnerName = `Canvas Learner ${Date.now()}`
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

	beforeEach(() => {
		cy.signIn(testEmail)
		cy.visit(`/mentor/learner/${learnerId}/canvas`)
	})

	it('displays the canvas header and learner self-expression notice', () => {
		cy.contains('h1', 'Canvas').should('be.visible')
		cy.contains(/Learner Self-Expression Space|Creative Space/i).should('be.visible')
		cy.contains('This canvas area is owned exclusively by the learner').should('be.visible')
	})

	it('does not allow the mentor to create or edit canvases', () => {
		cy.getByName('create-canvas-btn').should('not.exist')
		cy.getByName('toggle-edit-mode-btn').should('not.exist')
		cy.getByName('block-palette').should('not.exist')
	})

	it('shows the empty state message when learner has no canvases', () => {
		cy.contains('No Canvases Created Yet').should('be.visible')
		cy.contains('Canvases created by the learner will appear here.').should('be.visible')
	})
})
