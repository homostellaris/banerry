describe('Daily Quiz', () => {
	const testEmail = 'cypress-quiz@banerry.app'
	let passphrase: string

	function addScript(dialogue: string) {
		cy.getByName('add-script-button').click()
		cy.getByName('script-dialogue-input').type(dialogue)
		cy.getByName('create-script-submit').click()
		cy.contains(dialogue, { timeout: 10000 }).should('be.visible')
	}

	function navigateToLearnerScripts() {
		cy.visit('/mentor')
		cy.getByName('learner-card').contains('Quiz Learner').click()
		cy.get('a[href*="/scripts"]').first().click()
		cy.url().should('include', '/scripts')
	}

	before(() => {
		cy.signIn(testEmail)
		cy.createLearner('Quiz Learner')

		navigateToLearnerScripts()

		cy.get('code')
			.first()
			.invoke('text')
			.then(text => {
				passphrase = text.trim()
			})
	})

	it('does not show quiz button when learner has fewer than 4 scripts', () => {
		cy.clearAllCookies()
		cy.clearAllLocalStorage()
		cy.visit(`/learner/${passphrase}/scripts`)
		cy.contains('Daily Quiz').should('not.exist')
	})

	it('shows quiz button when learner has 4 or more scripts', () => {
		cy.signIn(testEmail)
		navigateToLearnerScripts()

		addScript('I want more please')
		addScript('Can we go outside?')
		addScript('I need help')
		addScript('Thank you')

		cy.clearAllCookies()
		cy.clearAllLocalStorage()
		cy.visit(`/learner/${passphrase}/scripts`)
		cy.contains('Daily Quiz').should('be.visible')
	})

	it('opens modal with 4 options after clicking quiz button', () => {
		cy.visit(`/learner/${passphrase}/scripts`)
		cy.contains('Daily Quiz').click()

		cy.getByName('quiz-option-card', { timeout: 60000 }).should(
			'have.length',
			4,
		)
	})

	it('crosses out wrong answer without closing modal', () => {
		cy.visit(`/learner/${passphrase}/scripts`)
		cy.contains('Daily Quiz').click()

		cy.getByName('quiz-option-card', { timeout: 60000 }).should(
			'have.length',
			4,
		)

		cy.getByName('quiz-option-card')
			.not('[data-quiz-correct="true"]')
			.first()
			.click()

		cy.contains('Well done!').should('not.exist')
		cy.getByName('quiz-option-card').should('have.length', 4)
		cy.getByName('quiz-option-card')
			.not('[data-quiz-correct="true"]')
			.first()
			.should('have.css', 'opacity')
	})

	it('shows Well done message when correct answer is selected', () => {
		cy.visit(`/learner/${passphrase}/scripts`)
		cy.contains('Daily Quiz').click()

		cy.getByName('quiz-option-card', { timeout: 60000 }).should(
			'have.length',
			4,
		)

		cy.getByName('quiz-option-card')
			.filter('[data-quiz-correct="true"]')
			.click()

		cy.contains('Well done!').should('be.visible')
	})
})
