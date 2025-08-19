// cypress/support/commands.ts
/// <reference types="cypress" />

// Custom commands for Banerry testing

Cypress.Commands.add('signIn', (email: string, name?: string) => {
  // Basic sign-in helper - can be extended based on auth flow
  cy.visit('/signin');
  
  // Check if we're already signed in
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="sign-in-form"]').length === 0) {
      // Already signed in, continue
      return;
    }
    
    // Fill sign-in form
    cy.get('[data-testid="email-input"]').type(email);
    if (name) {
      cy.get('[data-testid="name-input"]').type(name);
    }
    cy.get('[data-testid="sign-in-button"]').click();
    
    // Wait for redirect or success
    cy.url().should('not.include', '/signin');
  });
});

Cypress.Commands.add('createLearner', (name: string, bio?: string) => {
  cy.visit('/mentor');
  cy.get('[data-testid="create-learner-button"]').click();
  cy.get('[data-testid="learner-name-input"]').type(name);
  if (bio) {
    cy.get('[data-testid="learner-bio-input"]').type(bio);
  }
  cy.get('[data-testid="create-learner-submit"]').click();
  
  // Wait for learner to be created and return to mentor page
  cy.url().should('include', '/mentor');
});

export {};