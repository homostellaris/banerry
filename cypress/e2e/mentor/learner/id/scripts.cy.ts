describe('Script CRUD', () => {
	const testEmail = 'cypress-scripts@banerry.app'
	let learnerName: string

	before(() => {
		learnerName = `Script Learner ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)
	})

	beforeEach(() => {
		cy.signIn(testEmail)
		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.get('a[href*="/scripts"]').click()
		cy.url().should('include', '/scripts')
	})

	it('shows add script button', () => {
		cy.getByName('add-script-button').should('be.visible')
	})

	it('creates a script with dialogue only', () => {
		cy.getByName('add-script-button').click()
		cy.getByName('script-dialogue-input').type('I want more please')
		cy.getByName('create-script-submit').click()

		cy.contains('I want more please', { timeout: 10000 }).should('be.visible')
	})

	it('creates a script with dialogue and parentheticals', () => {
		cy.getByName('add-script-button').click()
		cy.getByName('script-dialogue-input').type("Let's go to the park")
		cy.getByName('script-parentheticals-input').type(
			'Used when they want to go outside',
		)
		cy.getByName('create-script-submit').click()

		cy.contains("Let's go to the park", { timeout: 10000 }).should('be.visible')
	})

	it('shows script cards after creation', () => {
		cy.getByName('script-card').should('have.length.at.least', 1)
	})
})

describe('Target scripts', () => {
	const testEmail = 'cypress-target@banerry.app'
	let learnerName: string

	before(() => {
		learnerName = `Target Learner ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)
	})

	beforeEach(() => {
		cy.signIn(testEmail)
		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.get('a[href*="/scripts"]').click()
		cy.url().should('include', '/scripts')
	})

	it('shows add target script button with count', () => {
		cy.getByName('add-target-script-button').should('be.visible')
		cy.getByName('add-target-script-button').should('contain', '(0/3)')
	})

	it('creates a target script', () => {
		cy.getByName('add-target-script-button').click()
		cy.getByName('target-script-dialogue-input').type('Can I have a turn?')
		cy.getByName('create-target-script-submit').click()

		cy.contains('Can I have a turn?', { timeout: 10000 }).should('be.visible')
		cy.getByName('add-target-script-button').should('contain', '(1/3)')
	})

	it('creates up to 3 target scripts', () => {
		cy.getByName('add-target-script-button').click()
		cy.getByName('target-script-dialogue-input').type('I need help')
		cy.getByName('create-target-script-submit').click()
		cy.contains('I need help', { timeout: 10000 }).should('be.visible')

		cy.getByName('add-target-script-button').click()
		cy.getByName('target-script-dialogue-input').type('Thank you')
		cy.getByName('create-target-script-submit').click()
		cy.contains('Thank you', { timeout: 10000 }).should('be.visible')

		cy.getByName('add-target-script-button').should('contain', '(3/3)')
	})

	it('disables add button at max 3 limit', () => {
		cy.getByName('add-target-script-button').should('be.disabled')
		cy.contains('(3/3)').should('be.visible')
	})
})
