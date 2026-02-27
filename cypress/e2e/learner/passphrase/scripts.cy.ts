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

		cy.visit('/mentor')
		cy.getByName('learner-card').contains('Quiz Learner').click()
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

	function interceptQuizApis() {
		cy.intercept('POST', '/api/generate-quiz-scenario', {
			statusCode: 200,
			body: {
				success: true,
				scenarioText: 'A child is hungry and wants a snack.',
			},
		})
		cy.intercept('POST', '/api/generate-image', {
			statusCode: 200,
			body: {
				success: true,
				imageData:
					'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
			},
		})
	}

	it('opens modal with 4 options after clicking quiz button', () => {
		interceptQuizApis()
		cy.visit(`/learner/${passphrase}/scripts`)
		cy.contains('Daily Quiz').click()

		cy.get('[data-name="quiz-option-card"]', { timeout: 10000 }).should(
			'have.length',
			4,
		)
	})

	it('crosses out wrong answer without closing modal', () => {
		interceptQuizApis()
		cy.visit(`/learner/${passphrase}/scripts`)
		cy.contains('Daily Quiz').click()

		cy.get('[data-name="quiz-option-card"]', { timeout: 10000 }).should(
			'have.length',
			4,
		)

		cy.get('[data-name="quiz-option-card"]')
			.not('[data-quiz-correct="true"]')
			.first()
			.click()

		cy.contains('Well done!').should('not.exist')
		cy.get('[data-name="quiz-option-card"]').should('have.length', 4)
		cy.get('[data-name="quiz-option-card"]')
			.not('[data-quiz-correct="true"]')
			.first()
			.should('have.css', 'opacity')
	})

	it('shows Well done message when correct answer is selected', () => {
		interceptQuizApis()
		cy.visit(`/learner/${passphrase}/scripts`)
		cy.contains('Daily Quiz').click()

		cy.get('[data-name="quiz-option-card"]', { timeout: 10000 }).should(
			'have.length',
			4,
		)

		cy.get('[data-name="quiz-option-card"][data-quiz-correct="true"]').click()

		cy.contains('Well done!').should('be.visible')
	})
})
