import ElevenLabsNavButton from '@/app/_tts/elevenlabs-nav-button'

it('renders with a mic icon and accessible label', () => {
	cy.mount(<ElevenLabsNavButton />)
	cy.get('button[aria-label="Talk to assistant"]').should('exist')
})

it('dispatches elevenlabs:trigger event when clicked', () => {
	let triggered = false
	cy.mount(<ElevenLabsNavButton />)
	cy.window().then(win => {
		win.addEventListener('elevenlabs:trigger', () => {
			triggered = true
		})
	})
	cy.get('button').click()
	cy.then(() => expect(triggered).to.be.true)
})

it('shows active state when widget becomes visible', () => {
	cy.mount(<ElevenLabsNavButton />)
	cy.get('button').then(() => {
		window.dispatchEvent(
			new CustomEvent('elevenlabs:mobile-visible', {
				detail: { visible: true },
			}),
		)
	})
	cy.get('button[aria-label="Dismiss assistant"]').should('exist')
})

it('returns to idle state when widget is hidden', () => {
	cy.mount(<ElevenLabsNavButton />)
	cy.get('button').then(() => {
		window.dispatchEvent(
			new CustomEvent('elevenlabs:mobile-visible', {
				detail: { visible: true },
			}),
		)
	})
	cy.get('button[aria-label="Dismiss assistant"]').should('exist')
	cy.get('button').then(() => {
		window.dispatchEvent(
			new CustomEvent('elevenlabs:mobile-visible', {
				detail: { visible: false },
			}),
		)
	})
	cy.get('button[aria-label="Talk to assistant"]').should('exist')
})
