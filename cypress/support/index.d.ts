/// <reference types="cypress" />

declare namespace Cypress {
	interface Chainable {
		signIn(email: string): Chainable<void>
		createLearner(name: string, bio?: string): Chainable<void>
		getByName(name: string): Chainable<JQuery<HTMLElement>>
	}
}
