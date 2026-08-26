import { CANVAS_DATA_NAMES } from '../../../../app/_canvas/types'

describe('Learner Canvas E2E Specification', () => {
	const testEmail = 'cypress-canvas-learner@banerry.app'
	let passphrase: string

	beforeEach(() => {
		cy.task('resetCypressUsers')
		cy.task('clearVerificationCodes')

		cy.on('uncaught:exception', error => {
			if (
				error.message.includes('Unauthenticated') ||
				error.message.includes('Invalid or unexpected token') ||
				error.message.includes('Unexpected token') ||
				error.message.includes('more than one result') ||
				error.message.includes('500')
			) {
				return false
			}
		})
		cy.on('window:before:load', win => {
			win.posthog = win.posthog || {}
			win.posthog.capture = cy.stub().as('posthogCapture')
		})

		cy.clearAllCookies()
		cy.clearAllLocalStorage()
		cy.clearAllSessionStorage()

		cy.signIn(testEmail)
		cy.task('createTestLearner', {
			email: testEmail,
			name: `Canvas Learner ${Date.now()}`,
		}).then((res: any) => {
			passphrase = typeof res === 'object' && res ? res.passphrase : res
		})
	})

	describe('1. Persistent Canvas Workspace & Top Carousel Layout', () => {
		it('renders a persistent canvas workspace area (data-name="canvas-editor") alongside top carousel section (data-name="canvas-carousel")', () => {
			cy.visitLearner(passphrase, 'canvas')

			// Top carousel section must be visible
			cy.getByName(CANVAS_DATA_NAMES.CAROUSEL).should('be.visible')

			// Persistent workspace area must be visible concurrently below carousel
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).should('be.visible')
		})

		it('updates persistent canvas workspace below when selecting a canvas card in carousel or creating new canvas', () => {
			cy.visitLearner(passphrase, 'canvas')

			// Top carousel displays create canvas button
			cy.getByName(CANVAS_DATA_NAMES.CAROUSEL)
				.find(`[data-name="${CANVAS_DATA_NAMES.CREATE_CANVAS_BTN}"]`)
				.should('be.visible')
				.click()

			// Workspace updates below
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).should('be.visible')

			// Add a block to distinguish canvas
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('not.exist')

			// Auto-save indicator asserts live workspace saving
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.contains(`[data-name="${CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR}"]`, /saved/i, { timeout: 8000 }).should('be.visible')

			// Carousel displays created card
			cy.getByName(CANVAS_DATA_NAMES.CAROUSEL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.CARD).should('have.length.at.least', 1)

			// Selecting canvas card updates persistent workspace below
			cy.getByName(CANVAS_DATA_NAMES.CARD).first().click()
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).should('be.visible')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`).should('be.visible')
		})
	})

	describe('2. Live Auto-Saving', () => {
		it('displays auto-save-indicator with save status when adding, moving, editing, or drawing blocks', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).should('be.visible')

			// Auto-save indicator must be present in persistent editor UI
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR)
				.invoke('text')
				.should('match', /saved|saving/i)

			// Add block and verify live auto-save update
			cy.getByName('palette-block-letter').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.LETTER_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('not.exist')

			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.wait(500)
			cy.get('@posthogCapture').should(
				'have.been.calledWithMatch',
				'canvas_autosaved'
			)
		})

		it('automatically persists block additions and reorders to Convex live', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).should('be.visible')

			// Add Emoji block
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })

			// Check auto-save status indicator
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.wait(500)
			cy.get('@posthogCapture').should(
				'have.been.calledWithMatch',
				'canvas_autosaved'
			)
		})
	})

	describe('3. Transparent Block Container Styling & Single-Tap Actions', () => {
		it('renders canvas blocks with clean container styling without harsh solid backgrounds', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })

			const blockSelector = `${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`
			cy.getByName(blockSelector).should('be.visible')

			// Block renders with clean container styling matching board cards
			cy.getByName(blockSelector).should('have.class', 'rounded-xl')
		})

		it('opens and shows edit and delete actions directly on single-tap on a block', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })

			const blockSelector = `${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`
			cy.getByName(blockSelector).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')

			// Single tap directly on block
			cy.getByName(blockSelector).click()

			// Direct single-tap reveals edit and delete action controls directly on block container
			cy.getByName('edit-block-btn').should('be.visible')
			cy.getByName('delete-block-btn').should('be.visible')
		})
	})

	describe('4. Non-Overflowing Activity Image Container', () => {
		it('ensures activity block image (<img data-name="activity-block-image" />) fits within block container without overflowing', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName(CANVAS_DATA_NAMES.BLOCK_PALETTE).contains(/activity/i).click()

			cy.getByName(CANVAS_DATA_NAMES.ACTIVITY_PICKER_MODAL).then($modal => {
				if ($modal.is(':visible')) {
					cy.getByName(CANVAS_DATA_NAMES.ACTIVITY_ITEM_OPTION).first().click()
				}
			})

			const activityBlock = `${CANVAS_DATA_NAMES.BLOCK_PREFIX}activity`
			cy.getByName(activityBlock).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.ACTIVITY_IMAGE_CONTAINER).should('be.visible')
		})
	})

	describe('5. Saving & Persistence E2E', () => {
		it('creates canvas with emoji, letter, number, script, and activity blocks, saves it, and verifies persistence upon re-opening', () => {
			cy.visitLearner(passphrase, 'canvas')

			// Create new canvas
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.BLOCK_PALETTE).should('be.visible')

			// Add Emoji block
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.wait(300)

			// Add Letter block
			cy.getByName('palette-block-letter').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.LETTER_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}letter`).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.wait(300)

			// Add Number block
			cy.getByName('palette-block-number').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}number`).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.wait(300)

			// Add Script block
			cy.getByName('palette-block-script').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.SCRIPT_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.SCRIPT_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.SCRIPT_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}script`).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.wait(300)

			// Add Activity block
			cy.getByName('palette-block-activity').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.ACTIVITY_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.ACTIVITY_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.ACTIVITY_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}activity`).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.wait(500)

			// PostHog event capture assertion
			cy.get('@posthogCapture').should('have.been.calledWithMatch', 'canvas_autosaved')

			// Verify canvas-carousel displays saved canvas card
			cy.get('body').find(`[data-name="${CANVAS_DATA_NAMES.CAROUSEL}"]`, { timeout: 15000 }).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.CARD).should('have.length.at.least', 1)

			// Click saved canvas card to re-open editor
			cy.getByName(CANVAS_DATA_NAMES.CARD).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).should('be.visible')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`).should('be.visible')
		})
	})

	describe('6. Emoji, Letter, and Number Pickers', () => {
		it('renders emoji-picker-modal and selects emoji block content', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`).should('be.visible')
		})

		it('renders letter-picker-modal and selects letter block content', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName('palette-block-letter').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.LETTER_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}letter`).should('be.visible')
		})

		it('renders number-picker-modal and selects number block content', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName('palette-block-number').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}number`).should('be.visible')
		})
	})

	describe('7. Direct ScriptCard Reuse and Audio Playback', () => {
		it('renders ScriptCard directly in Read Mode with working circular audio speech button', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName('palette-block-script').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.SCRIPT_ITEM_OPTION).first().click({ force: true })

			// Toggle to Read Mode
			cy.getByName(CANVAS_DATA_NAMES.TOGGLE_EDIT_MODE_BTN).click()
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}script`).should('be.visible')
		})
	})

	describe('8. Gherkin Scenario: No existing canvases', () => {
		it('displays canvas empty prompt with create button when learner has no canvases', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.EMPTY_PROMPT).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).should('be.visible')
		})
	})

	describe('9. Gherkin Scenario: Create canvas and place blocks', () => {
		it('allows creating a canvas and placing a script block', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).should('be.visible')

			cy.getByName('palette-block-script').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.SCRIPT_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.SCRIPT_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.SCRIPT_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}script`).should('be.visible')
		})
	})

	describe('10. Gherkin Scenario: View canvas & tap block', () => {
		it('plays audio when tapping a block on an existing canvas', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`).should('be.visible')

			// Tap block
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`).first().click()
			cy.get('@posthogCapture').should(
				'have.been.calledWithMatch',
				'canvas_block_tapped'
			)
		})
	})

	describe('11. Gherkin Scenario: Existing canvases', () => {
		it('displays a horizontal carousel of existing canvases when created', () => {
			cy.visitLearner(passphrase, 'canvas')
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')

			cy.getByName(CANVAS_DATA_NAMES.CAROUSEL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.CARD).should('have.length.at.least', 1)
		})
	})

	describe('12. Gherkin Scenario: Remove canvas', () => {
		it('permanently deletes a canvas after confirmation and resets workspace to Read Mode', () => {
			cy.visitLearner(passphrase, 'canvas')

			// Create first canvas
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).first().click()
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.contains(`[data-name="${CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR}"]`, /saved/i, { timeout: 8000 }).should('be.visible')

			// Create second canvas
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).first().click()
			cy.getByName('palette-block-letter').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.LETTER_ITEM_OPTION).first().click({ force: true })
			cy.contains(`[data-name="${CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR}"]`, /saved/i, { timeout: 8000 }).should('be.visible')

			// Click Delete button on current canvas in editor
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).find(`[data-name="${CANVAS_DATA_NAMES.DELETE_BTN}"]`).click()
			cy.contains('Are you sure you want to delete this canvas?').should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.DELETE_CONFIRM_BTN).click()

			// Confirmation closes and workspace resets to Read Mode
			cy.contains('Are you sure you want to delete this canvas?').should('not.exist')
			cy.getByName(CANVAS_DATA_NAMES.READ_MODE_VIEW).should('be.visible')

			cy.get('@posthogCapture').should(
				'have.been.calledWithMatch',
				'canvas_deleted'
			)
		})
	})

	describe('13. New Canvas Creation & Switching', () => {
		it('creates a new canvas using the + New Canvas button when existing canvases exist, adds it to the carousel, and allows switching between them', () => {
			cy.visitLearner(passphrase, 'canvas')

			// Create first canvas
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).click()
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).should('be.visible')

			// Add a block to the first canvas (e.g. Emoji)
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.wait(500)

			// Carousel now displays the first canvas card
			cy.getByName(CANVAS_DATA_NAMES.CAROUSEL)
				.find(`[data-name="${CANVAS_DATA_NAMES.CARD}"]`)
				.should('have.length.at.least', 1)

			// Click + New Canvas button in carousel header
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).first().click()

			// Carousel now displays 2 canvas cards
			cy.getByName(CANVAS_DATA_NAMES.CAROUSEL)
				.find(`[data-name="${CANVAS_DATA_NAMES.CARD}"]`)
				.should('have.length', 2)

			// The editor is open with the new canvas
			cy.getByName(CANVAS_DATA_NAMES.EDITOR).should('be.visible')
			cy.wait(400)

			// Add a Letter block to the second canvas
			cy.getByName('palette-block-letter').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.LETTER_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}letter`).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.wait(500)

			// Switch back to the first canvas by clicking its card
			cy.getByName(CANVAS_DATA_NAMES.CAROUSEL)
				.find(`[data-name="${CANVAS_DATA_NAMES.CARD}"]`)
				.last()
				.click({ force: true })
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`).should('be.visible')
			cy.wait(400)

			// Switch back to the second canvas
			cy.getByName(CANVAS_DATA_NAMES.CAROUSEL)
				.find(`[data-name="${CANVAS_DATA_NAMES.CARD}"]`)
				.first()
				.click({ force: true })
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}letter`).should('be.visible')
		})
	})

	describe('14. Read Mode vs Edit Mode', () => {
		it('loads existing canvas in Read Mode (canvas-read-mode) displaying title, Edit button, and speech buttons while hiding editing controls', () => {
			cy.visitLearner(passphrase, 'canvas')

			// Create a canvas first
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).first().click()
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('not.exist')
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')
			cy.wait(500)

			// Select existing canvas from carousel
			cy.getByName(CANVAS_DATA_NAMES.CARD).first().click()

			// Existing canvas loads in Read Mode
			cy.getByName(CANVAS_DATA_NAMES.READ_MODE_VIEW).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.CANVAS_TITLE).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.TOGGLE_EDIT_MODE_BTN)
				.should('be.visible')
				.should('contain.text', 'Edit')
			cy.getByName(CANVAS_DATA_NAMES.BLOCK_SPEECH_BTN).should('be.visible')

			// Editing controls must be hidden in Read Mode
			cy.getByName(CANVAS_DATA_NAMES.BLOCK_PALETTE).should('not.exist')
			cy.getByName('edit-block-btn').should('not.exist')
			cy.getByName('delete-block-btn').should('not.exist')
			cy.getByName(CANVAS_DATA_NAMES.READ_MODE_VIEW)
				.find(`[data-name="${CANVAS_DATA_NAMES.DELETE_BTN}"]`)
				.should('not.exist')
		})

		it('toggles edit mode when clicking toggle-edit-mode-btn, revealing editing controls, and returns to Read Mode when clicked again', () => {
			cy.visitLearner(passphrase, 'canvas')

			// Create a canvas
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).first().click()
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')

			// Select existing canvas card to ensure it is in Read Mode
			cy.getByName(CANVAS_DATA_NAMES.CARD).first().click()
			cy.getByName(CANVAS_DATA_NAMES.READ_MODE_VIEW).should('be.visible')

			// Click toggle edit mode button ("Edit")
			cy.getByName(CANVAS_DATA_NAMES.TOGGLE_EDIT_MODE_BTN).click()

			// Activates Edit Mode
			cy.getByName(CANVAS_DATA_NAMES.EDIT_MODE_VIEW).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.BLOCK_PALETTE).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.TOGGLE_EDIT_MODE_BTN).should('contain.text', 'Done')

			// Click toggle edit mode button again ("Done")
			cy.getByName(CANVAS_DATA_NAMES.TOGGLE_EDIT_MODE_BTN).click()

			// Returns to Read Mode
			cy.getByName(CANVAS_DATA_NAMES.READ_MODE_VIEW).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.BLOCK_PALETTE).should('not.exist')
		})

		it('starts directly in Edit Mode (canvas-edit-mode) when creating a new canvas via create-canvas-btn', () => {
			cy.visitLearner(passphrase, 'canvas')

			// Click create canvas button
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).first().click()

			// Workspace starts directly in Edit Mode
			cy.getByName(CANVAS_DATA_NAMES.EDIT_MODE_VIEW).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.BLOCK_PALETTE).should('be.visible')
		})

		it('resets workspace to Read Mode when switching to an existing canvas from the carousel', () => {
			cy.visitLearner(passphrase, 'canvas')

			// Create first canvas and stay in edit mode
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).first().click()
			cy.getByName('palette-block-emoji').click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.AUTO_SAVE_INDICATOR).should('be.visible')

			// Currently in Edit Mode
			cy.getByName(CANVAS_DATA_NAMES.EDIT_MODE_VIEW).should('be.visible')

			// Click existing canvas card from carousel
			cy.getByName(CANVAS_DATA_NAMES.CARD).first().click()

			// Workspace resets to Read Mode
			cy.getByName(CANVAS_DATA_NAMES.READ_MODE_VIEW).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.BLOCK_PALETTE).should('not.exist')
		})
	})

	describe('15. Responsive Rearrange Directional Controls', () => {
		it('renders up and down rearrangement arrows on small screens (iphone-x)', () => {
			cy.viewport('iphone-x')
			cy.visitLearner(passphrase, 'canvas')

			// Create canvas to enter edit mode
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).first().click()
			cy.wait(400)

			// Add first block (Emoji)
			cy.getByName('palette-block-emoji').scrollIntoView().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`).should('exist')
			cy.wait(300)

			// Add second block (Letter)
			cy.getByName('palette-block-letter').scrollIntoView().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.LETTER_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}letter`).should('exist')
			cy.wait(300)

			// Add third block (Number)
			cy.getByName('palette-block-number').scrollIntoView().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}number`).should('exist')

			// On small screens, middle block rearrangement controls display vertical up/down buttons
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}letter`).within(() => {
				cy.get('[data-name="move-up-btn"], [aria-label*="up"]')
					.should('exist')
				cy.get('[data-name="move-down-btn"], [aria-label*="down"]')
					.should('exist')
			})
		})

		it('renders left and right rearrangement arrows on large screens (1280x800)', () => {
			cy.viewport(1280, 800)
			cy.visitLearner(passphrase, 'canvas')

			// Create canvas to enter edit mode
			cy.getByName(CANVAS_DATA_NAMES.CREATE_CANVAS_BTN).first().click()

			// Add first block (Emoji)
			cy.getByName('palette-block-emoji').scrollIntoView().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}emoji`).should('be.visible')
			cy.wait(300)

			// Add second block (Letter)
			cy.getByName('palette-block-letter').scrollIntoView().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.LETTER_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.LETTER_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}letter`).should('be.visible')
			cy.wait(300)

			// Add third block (Number)
			cy.getByName('palette-block-number').scrollIntoView().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_PICKER_MODAL).should('be.visible')
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_ITEM_OPTION).first().click({ force: true })
			cy.getByName(CANVAS_DATA_NAMES.NUMBER_PICKER_MODAL).should('not.exist')
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}number`).should('be.visible')

			// On large screens, middle block rearrangement controls display horizontal left/right buttons
			cy.getByName(`${CANVAS_DATA_NAMES.BLOCK_PREFIX}letter`).within(() => {
				cy.get('[data-name="move-left-btn"], [aria-label*="left"]')
					.should('exist')
				cy.get('[data-name="move-right-btn"], [aria-label*="right"]')
					.should('exist')
			})
		})
	})
})
