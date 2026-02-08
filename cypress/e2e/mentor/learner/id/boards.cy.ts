describe('Board management', () => {
	const testEmail = 'cypress-boards@banerry.app'
	let learnerName: string

	before(() => {
		learnerName = `Board Learner ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)
	})

	beforeEach(() => {
		cy.signIn(testEmail)
		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.contains(learnerName).should('be.visible')
		cy.get('a[href*="/boards"]').should('be.visible').click()
		cy.url().should('include', '/boards')
	})

	it('shows empty state with create button when no boards exist', () => {
		cy.getByName('create-first-board-button').should('be.visible')
		cy.contains('No saved boards yet').should('be.visible')
	})

	it('creates a first board', () => {
		cy.getByName('create-first-board-button').click()
		cy.contains('New board created').should('be.visible')
		cy.getByName('board-card').should('exist')
	})

	it('creates additional boards', () => {
		cy.get('body').then($body => {
			if ($body.find('[data-name="create-first-board-button"]').length > 0) {
				cy.getByName('create-first-board-button').click()
			}
		})
		cy.getByName('new-board-button').should('be.visible').click()
		cy.contains('New board created').should('be.visible')
		cy.getByName('board-card').should('have.length.at.least', 2)
	})

	it('switches between boards', () => {
		cy.getByName('board-card').should('have.length.at.least', 2)
		cy.getByName('board-card').last().click()
		cy.getByName('board-card')
			.last()
			.closest('[class*="ring-2"]')
			.should('exist')
	})
})

describe('Board columns', () => {
	const testEmail = 'cypress-columns@banerry.app'
	let learnerName: string

	before(() => {
		learnerName = `Column Learner ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)

		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.get('a[href*="/boards"]').click()
		cy.getByName('create-first-board-button').click()
		cy.contains('New board created').should('be.visible')
	})

	beforeEach(() => {
		cy.signIn(testEmail)
		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.get('a[href*="/boards"]').click()
		cy.url().should('include', '/boards')
	})

	it('displays default columns on a new board', () => {
		cy.getByName('column-title').should('have.length.at.least', 1)
	})

	it('adds a new column', () => {
		cy.getByName('column-title').then($titles => {
			const initialCount = $titles.length
			cy.getByName('add-column-button').click()
			cy.contains('Column added').should('be.visible')
			cy.getByName('column-title').should('have.length', initialCount + 1)
		})
	})

	it('edits a column title', () => {
		cy.getByName('column-title').first().click()
		cy.get("input[class*='text-center']").clear().type('Morning{enter}')
		cy.getByName('column-title').first().should('contain', 'Morning')
	})

	it('sets a timer preset on a column', () => {
		cy.getByName('column-image-area').first().click()
		cy.getByName('timer-button-5').click()
		cy.contains('Timer set for 5 minute(s)').should('be.visible')
		cy.contains('5m').should('be.visible')
	})

	it('deletes a column when more than one exists', () => {
		cy.getByName('add-column-button').click()
		cy.contains('Column added').should('be.visible')

		cy.getByName('column-title').then($titles => {
			const countBefore = $titles.length

			cy.get('[data-name="column-title"]')
				.last()
				.closest('.group')
				.find('button')
				.filter(':has(svg)')
				.first()
				.click({ force: true })

			cy.contains('Column deleted').should('be.visible')
			cy.getByName('column-title').should('have.length', countBefore - 1)
		})
	})
})

describe('Board image generation', () => {
	const testEmail = 'cypress-imggen@banerry.app'
	let learnerName: string

	before(() => {
		learnerName = `ImgGen Learner ${Date.now()}`
		cy.signIn(testEmail)
		cy.createLearner(learnerName)

		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.get('a[href*="/boards"]').click()
		cy.getByName('create-first-board-button').click()
		cy.contains('New board created').should('be.visible')
	})

	beforeEach(() => {
		cy.signIn(testEmail)
		cy.visit('/mentor')
		cy.getByName('learner-card').contains(learnerName).click()
		cy.get('a[href*="/boards"]').click()
		cy.url().should('include', '/boards')
	})

	it('generates an image for a single column', () => {
		cy.intercept('POST', '/api/generate-image', {
			success: true,
			imageData:
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
			originalPrompt: 'A boy eating breakfast',
			size: '1024x1024',
		}).as('generateImage')

		cy.getByName('column-image-area').first().click()
		cy.getByName('column-prompt-input').type('A boy eating breakfast')
		cy.getByName('generate-image-button').click()

		cy.contains('Generating...').should('be.visible')
		cy.contains('Image generated successfully', { timeout: 30000 }).should(
			'be.visible',
		)
		cy.getByName('column-image-area').first().find('img').should('exist')
	})

	it('generates all column images with batch prompt', () => {
		cy.intercept('POST', '/api/generate-board-images', {
			success: true,
			boardName: 'Morning Routine',
			parsedPrompt: {
				boardName: 'Morning Routine',
				columns: [
					{ title: 'Brushing teeth', prompt: 'brushing teeth' },
					{ title: 'Eating breakfast', prompt: 'eating breakfast' },
					{ title: 'Going to school', prompt: 'going to school' },
				],
			},
			images: [
				{
					columnId: 'col-1',
					title: 'Brushing teeth',
					imageData:
						'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
					prompt: 'brushing teeth',
				},
				{
					columnId: 'col-2',
					title: 'Eating breakfast',
					imageData:
						'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
					prompt: 'eating breakfast',
				},
				{
					columnId: 'col-3',
					title: 'Going to school',
					imageData:
						'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
					prompt: 'going to school',
				},
			],
		}).as('generateBoardImages')

		cy.getByName('batch-prompt-input').type(
			'brushing teeth, eating breakfast, going to school',
		)
		cy.getByName('batch-generate-button').click()

		cy.contains('Generating...').should('be.visible')
		cy.contains('All images generated successfully', { timeout: 60000 }).should(
			'be.visible',
		)
	})

	it('changes the image style', () => {
		cy.get('body').then($body => {
			if ($body.find('[data-name="style-selector"]').length > 0) {
				cy.getByName('style-selector').click()
				cy.contains('Play-Doh').click()
				cy.getByName('style-selector').should('contain', 'Play-Doh')
			}
		})
	})
})

describe('Boards (unauthenticated)', () => {
	beforeEach(() => {
		cy.clearAllCookies()
		cy.clearAllLocalStorage()
		cy.clearAllSessionStorage()
	})

	it('redirects to signin when not authenticated', () => {
		cy.visit('/mentor/learner/fake-id/boards', { failOnStatusCode: false })
		cy.url({ timeout: 10000 }).should('include', '/signin')
	})

	it('shows sign-in form when visiting boards without auth', () => {
		cy.visit('/mentor/learner/fake-id/boards', { failOnStatusCode: false })
		cy.get('[data-name="email-input"]', { timeout: 10000 }).should('be.visible')
		cy.getByName('send-code-button').should('be.visible')
	})
})
