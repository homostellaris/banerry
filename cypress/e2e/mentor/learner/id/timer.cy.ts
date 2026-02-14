describe('Timer', () => {
	const testEmail = 'cypress-timer@banerry.app'
	let learnerName: string

	before(() => {
		learnerName = `Timer Learner ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)
	})

	beforeEach(() => {
		cy.signIn(testEmail)
		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.get('a[href*="/timer"]').click()
		cy.url().should('include', '/timer')
	})

	it('displays timer controls', () => {
		cy.contains('Set Timer').should('be.visible')
		cy.contains('Quick Timers').should('be.visible')
		cy.contains('Start').should('be.visible')
	})

	it('sets a preset timer', () => {
		cy.contains('5 sec').click()
		cy.get('#seconds').should('have.value', '5')
	})

	it('starts, pauses, and resumes a timer', () => {
		cy.clock()
		cy.contains('10 sec').click()
		cy.contains('Start').click()

		cy.contains('Pause').should('be.visible')
		cy.tick(3000)

		cy.contains('Pause').click()
		cy.contains('Resume').should('be.visible')

		cy.contains('Resume').click()
		cy.contains('Pause').should('be.visible')
		cy.clock().then(clock => clock.restore())
	})

	it('completes a timer and shows completion state', () => {
		cy.clock()
		cy.contains('5 sec').click()
		cy.contains('Start').click()

		cy.tick(6000)
		cy.contains("Time's Up!").should('be.visible')
		cy.clock().then(clock => clock.restore())
	})

	it('stops a running timer', () => {
		cy.clock()
		cy.contains('10 sec').click()
		cy.contains('Start').click()
		cy.tick(2000)
		cy.contains('Stop').click()

		cy.contains('Start').should('be.visible')
		cy.clock().then(clock => clock.restore())
	})

	it('resets the timer', () => {
		cy.contains('30 sec').click()
		cy.contains('Reset').click()
		cy.get('#seconds').should('have.value', '0')
	})
})
