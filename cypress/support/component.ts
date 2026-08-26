import React from 'react'
import { mount } from 'cypress/react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { VoiceProvider } from '@/app/_tts/voice-context'
import './commands'

const mockConvexClient = new ConvexReactClient('https://mock-convex.banerry.local', {
	disabled: true,
})

declare global {
	namespace Cypress {
		interface Chainable {
			mount: typeof mount
		}
	}
}

Cypress.Commands.add('mount', (jsx: React.ReactNode, options?: any) => {
	const wrapped = React.createElement(
		ConvexProvider,
		{ client: mockConvexClient },
		React.createElement(VoiceProvider, null, jsx),
	)
	return mount(wrapped, options)
})
