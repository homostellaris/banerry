describe('Learner profile editor', () => {
	const testEmail = 'cypress-profile@banerry.app'
	let learnerName: string

	before(() => {
		learnerName = `Profile Learner ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)
	})

	beforeEach(() => {
		cy.signIn(testEmail)
		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.contains(learnerName).should('be.visible')
	})

	it('edits bio, saves, and verifies persistence', () => {
		const bioText = 'Enjoys building with blocks and painting'
		cy.getByName('bio-input').clear().type(bioText)
		cy.getByName('save-profile-button').should('not.be.disabled').click()
		cy.contains('Profile saved successfully').should('be.visible')

		cy.reload()
		cy.getByName('bio-input').should('have.value', bioText)
	})

	it('selects avatar style', () => {
		cy.getByName('avatar-style-select').click()
		cy.contains('Play-Doh').click()
		cy.getByName('avatar-style-select').should('contain', 'Play-Doh')
	})

	it('enters avatar description', () => {
		const avatarDescription =
			'7-year-old boy with short brown hair, brown eyes, wearing a green dinosaur t-shirt'
		cy.getByName('avatar-prompt-input').clear().type(avatarDescription)
		cy.getByName('avatar-prompt-input').should('have.value', avatarDescription)
	})

	it('generates avatar and sees preview', () => {
		cy.intercept('POST', '/api/generate-image', {
			success: true,
			imageData:
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
			originalPrompt: 'test',
			size: '1024x1024',
		}).as('generateImage')

		cy.getByName('avatar-prompt-input')
			.clear()
			.type('7-year-old girl with long red hair')
		cy.getByName('generate-avatar-button').click()

		cy.contains('Generating...').should('be.visible')
		cy.get('[data-name="avatar-preview"]', { timeout: 30000 }).should(
			'be.visible',
		)
		cy.contains('Avatar generated').should('be.visible')
	})

	it('saves profile with avatar and persists on reload', () => {
		cy.intercept('POST', '/api/generate-image', {
			success: true,
			imageData:
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
			originalPrompt: 'test',
			size: '1024x1024',
		}).as('generateImage')

		cy.getByName('avatar-prompt-input')
			.clear()
			.type('7-year-old girl with long red hair')
		cy.getByName('generate-avatar-button').click()
		cy.get('[data-name="avatar-preview"]', { timeout: 30000 }).should(
			'be.visible',
		)

		cy.getByName('save-profile-button').click()
		cy.contains('Profile saved successfully').should('be.visible')

		cy.reload()
		cy.getByName('avatar-preview').should('be.visible')
		cy.getByName('avatar-prompt-input').should(
			'have.value',
			'7-year-old girl with long red hair',
		)
	})
})
