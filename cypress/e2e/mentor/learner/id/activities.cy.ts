const STUB_IMAGE =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

function interceptGenerateImage() {
	return cy
		.intercept('POST', '/api/generate-image', {
			success: true,
			imageData: STUB_IMAGE,
			originalPrompt: 'test',
			size: '1024x1024',
		})
		.as('generateImage')
}

describe('Mentor activities page', () => {
	const testEmail = 'cypress-activities@banerry.app'
	let learnerName: string

	before(() => {
		learnerName = `Activities Learner ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)

		// Set up a board with a generated image so the activities page has cards
		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.get('a[href*="/boards"]').click()
		cy.getByName('create-first-board-button').click()
		cy.contains('New board created').should('be.visible')

		interceptGenerateImage()
		cy.getByName('column-image-area').first().click()
		cy.getByName('column-prompt-input').type('Brush Teeth')
		cy.getByName('generate-image-button').click()
		cy.contains('Image generated successfully', { timeout: 30000 }).should(
			'be.visible',
		)
	})

	beforeEach(() => {
		cy.signIn(testEmail)
		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.get('a[href*="/activities"]').click()
		cy.url().should('include', '/activities')
	})

	it('shows activity cards for board columns that have images', () => {
		cy.getByName('activity-card').should('have.length.at.least', 1)
	})

	it('shows the column title on each card', () => {
		cy.getByName('activity-title').first().invoke('text').should('have.length.gt', 0)
	})

	it('shows the edit title button on each card', () => {
		cy.getByName('activity-edit-title-button').first().should('exist')
	})

	describe('title editing', () => {
		it('opens title input when pencil clicked', () => {
			cy.getByName('activity-edit-title-button').first().click()
			cy.getByName('activity-title-input').should('be.visible')
		})

		it('saves updated title on check button click', () => {
			const newTitle = `Edited ${Date.now()}`
			cy.getByName('activity-edit-title-button').first().click()
			cy.getByName('activity-title-input').clear().type(newTitle)
			cy.getByName('activity-save-title-button').click()
			cy.getByName('activity-title').first().should('contain', newTitle)
		})

		it('cancels editing and restores original title on X click', () => {
			cy.getByName('activity-title')
				.first()
				.invoke('text')
				.then(original => {
					cy.getByName('activity-edit-title-button').first().click()
					cy.getByName('activity-title-input').clear().type('Temporary Value')
					cy.getByName('activity-cancel-title-button').click()
					cy.getByName('activity-title').first().should('contain', original.trim())
				})
		})

		it('title change is reflected on boards page', () => {
			const newTitle = `Board Sync ${Date.now()}`
			cy.getByName('activity-edit-title-button').first().click()
			cy.getByName('activity-title-input').clear().type(newTitle)
			cy.getByName('activity-save-title-button').click()
			cy.getByName('activity-title').first().should('contain', newTitle)

			// Navigate to boards and confirm the change propagated
			cy.get('a[href*="/boards"]').click()
			cy.url().should('include', '/boards')
			cy.getByName('column-title').should('contain', newTitle)
		})
	})

	describe('image regeneration', () => {
		it('shows image prompt area when sparkle button clicked', () => {
			cy.getByName('activity-change-image-button').first().click({ force: true })
			cy.getByName('activity-image-prompt-area').should('be.visible')
		})

		it('generates a new image with the given prompt', () => {
			interceptGenerateImage()
			cy.getByName('activity-change-image-button').first().click({ force: true })
			cy.getByName('activity-image-prompt-input').clear().type('A child washing hands')
			cy.getByName('activity-generate-image-button').click()
			cy.contains('Image updated!', { timeout: 30000 }).should('be.visible')
			cy.getByName('activity-image-prompt-area').should('not.exist')
		})

		it('cancels image prompt on X click', () => {
			cy.getByName('activity-change-image-button').first().click({ force: true })
			cy.getByName('activity-image-prompt-area').should('be.visible')
			cy.getByName('activity-cancel-image-button').click()
			cy.getByName('activity-image-prompt-area').should('not.exist')
		})
	})
})

describe('Mentor activities page (unauthenticated)', () => {
	beforeEach(() => {
		cy.clearAllCookies()
		cy.clearAllLocalStorage()
		cy.clearAllSessionStorage()
	})

	it('redirects to signin when not authenticated', () => {
		cy.visit('/mentor/learner/fake-id/activities', { failOnStatusCode: false })
		cy.url({ timeout: 10000 }).should('include', '/signin')
	})
})
