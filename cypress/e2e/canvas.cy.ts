describe('Learner Canvas', () => {
	const testEmail = 'cypress-canvas@banerry.app'
	let passphrase = ''

	before(() => {
		cy.signIn(testEmail)
		cy.task('createTestLearner', {
			email: testEmail,
			name: `Canvas Learner ${Date.now()}`,
		}).then((res: any) => {
			let data: any
			if (typeof res === 'string') {
				try {
					data = JSON.parse(res)
				} catch {
					try {
						data = Function('"use strict";return (' + res + ')')()
					} catch {
						data = { passphrase: res }
					}
				}
			} else {
				data = res
			}
			passphrase = data?.passphrase || (typeof res === 'string' ? res : '')
		})
	})

	beforeEach(() => {
		cy.on('uncaught:exception', error => {
			if (error.message.includes('Unauthenticated')) return false
		})
		cy.clearAllCookies()
		cy.clearAllLocalStorage()
		cy.clearAllSessionStorage()
	})

	it('Scenario: No existing canvases - prompts learner to create canvas with visual example', () => {
		cy.visit(`/learner/${passphrase}/canvas`)
		cy.getByName('canvas-empty-state', { timeout: 10000 }).should('be.visible')
		cy.getByName('canvas-example-preview', { timeout: 10000 }).should('be.visible')
		cy.getByName('create-canvas-button', { timeout: 10000 }).should('be.visible')
	})

	it('Scenario Outline: Create canvas and place blocks (script, activity, emoji, letter, number, paint) & track PostHog event', () => {
		cy.visit(`/learner/${passphrase}/canvas`, {
			onBeforeLoad(win) {
				win.posthog = {
					capture: cy.stub().as('posthogCapture'),
				} as any
			},
		})

		cy.getByName('create-canvas-button', { timeout: 10000 }).click()
		cy.getByName('canvas-title-input', { timeout: 10000 }).type('My Creative Space')

		const blocks = ['script', 'activity', 'emoji', 'letter', 'number', 'paint']
		blocks.forEach(blockType => {
			cy.getByName(`add-block-${blockType}`).click()
			cy.getByName(`canvas-block-${blockType}`, { timeout: 10000 }).should('be.visible')
		})

		cy.getByName('save-canvas-button').click()
		cy.contains('My Creative Space', { timeout: 10000 }).should('be.visible')

		cy.get('@posthogCapture').should('have.been.calledWith', 'canvas_created', Cypress.sinon.match.object)
	})

	it('Scenario Outline: View canvas, tap on block to say out loud and animate & track PostHog event', () => {
		cy.visit(`/learner/${passphrase}/canvas`, {
			onBeforeLoad(win) {
				win.posthog = {
					capture: cy.stub().as('posthogCapture'),
				} as any
			},
		})

		cy.getByName('canvas-card', { timeout: 10000 }).first().click()
		cy.getByName('canvas-block-emoji', { timeout: 10000 }).first().click()
		cy.getByName('canvas-block-emoji').first().should('have.class', 'animate-seed-bounce')

		cy.get('@posthogCapture').should('have.been.calledWith', 'canvas_block_tapped', Cypress.sinon.match.object)
	})

	it('Scenario: Existing canvases - displays horizontal carousel of existing canvases', () => {
		cy.visit(`/learner/${passphrase}/canvas`)
		cy.getByName('canvas-carousel', { timeout: 10000 }).should('be.visible')
		cy.getByName('canvas-card', { timeout: 10000 }).should('have.length.at.least', 1)
	})

	it('Scenario: Remove canvas - deletes canvas after confirmation & tracks PostHog event', () => {
		cy.visit(`/learner/${passphrase}/canvas`, {
			onBeforeLoad(win) {
				win.posthog = {
					capture: cy.stub().as('posthogCapture'),
				} as any
			},
		})

		cy.getByName('canvas-card', { timeout: 10000 }).first().click()
		cy.getByName('delete-canvas-button', { timeout: 10000 }).click()
		cy.getByName('confirm-delete-canvas-button', { timeout: 10000 }).click()

		cy.get('@posthogCapture').should('have.been.calledWith', 'canvas_deleted', Cypress.sinon.match.object)
		cy.getByName('canvas-card', { timeout: 10000 }).should('not.exist')
	})
})
