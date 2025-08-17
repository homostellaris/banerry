/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    signIn(email: string, name?: string): Chainable<void>
    createLearner(name: string, bio?: string): Chainable<void>
  }
}