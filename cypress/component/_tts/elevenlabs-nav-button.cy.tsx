import ElevenLabsNavButton from '@/app/_tts/elevenlabs-nav-button'

it('renders with a mic icon and accessible label', () => {
	cy.mount(<ElevenLabsNavButton />)
	cy.get('button[aria-label="Talk to assistant"]').should('exist')
})

it('dispatches elevenlabs:trigger event when clicked', () => {
	cy.mount(<ElevenLabsNavButton />)
	cy.window().then(win => {
		cy.spy(win, 'dispatchEvent').as('dispatch')
	})
	cy.get('button').click()
	cy.get('@dispatch').should(
		'have.been.calledWithMatch',
		Cypress.sinon.match.has('type', 'elevenlabs:trigger'),
	)
})

it('shows active state when conversation starts', () => {
	cy.mount(<ElevenLabsNavButton />)
	cy.window().then(win => {
		win.dispatchEvent(new CustomEvent('elevenlabs:conversation-start'))
	})
	cy.get('button[aria-label="Assistant is listening"]').should('exist')
})

it('returns to idle state when conversation ends', () => {
	cy.mount(<ElevenLabsNavButton />)
	cy.window().then(win => {
		win.dispatchEvent(new CustomEvent('elevenlabs:conversation-start'))
	})
	cy.get('button[aria-label="Assistant is listening"]').should('exist')
	cy.window().then(win => {
		win.dispatchEvent(new CustomEvent('elevenlabs:conversation-end'))
	})
	cy.get('button[aria-label="Talk to assistant"]').should('exist')
})
