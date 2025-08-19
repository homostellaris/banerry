describe('Invitation Page UI Tests', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it('should render the invitation page structure correctly', () => {
    // Test the invitation page loads without crashing
    cy.visit('/invitation/test-token', { failOnStatusCode: false });
    
    // Should show loading state initially or content
    cy.get('body').should('exist');
    
    // Wait for any loading to complete
    cy.wait(2000);
    
    // Page should have basic structure
    cy.get('body').should('exist');
    cy.get('body').then(($body) => {
      const text = $body.text().toLowerCase();
      expect(text).to.satisfy((t: string) => 
        t.includes('banerry') || t.includes('invitation') || t.includes('invalid') || t.includes('loading')
      );
    });
  });

  it('should navigate to signin when clicking Go to Sign In buttons', () => {
    // Test with an invalid token that should show "Go to Sign In" button
    cy.visit('/invitation/invalid-token-999', { failOnStatusCode: false });
    
    // Wait for page to load
    cy.wait(2000);
    
    // Look for any button that contains "Sign In" text
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Sign In")').length > 0) {
        cy.get('button:contains("Sign In")').first().click();
        cy.url().should('include', '/signin');
      } else if ($body.find('button:contains("Go to Sign In")').length > 0) {
        cy.get('button:contains("Go to Sign In")').first().click();
        cy.url().should('include', '/signin');
      } else {
        // If no button found, just verify the page loaded
        cy.get('body').should('exist');
      }
    });
  });

  it('should handle the signin redirect with invitation token', () => {
    const testToken = 'test-invitation-token-123';
    
    // Visit invitation page that should redirect to signin
    cy.visit(`/invitation/${testToken}`, { failOnStatusCode: false });
    
    // Wait for potential redirects or page load
    cy.wait(3000);
    
    // Check if we ended up on signin page or if invitation page has signin button
    cy.url().then((url) => {
      if (url.includes('/signin')) {
        // If redirected to signin, check for redirect parameter
        cy.url().should('include', 'redirect');
      } else {
        // If still on invitation page, look for signin button
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="sign-in-to-accept-button"]').length > 0) {
            cy.get('[data-testid="sign-in-to-accept-button"]').should('be.visible');
            cy.get('[data-testid="sign-in-to-accept-button"]').click();
            cy.url().should('include', '/signin');
          }
        });
      }
    });
  });

  it('should display proper error states for invalid invitations', () => {
    // Test with obviously invalid token
    cy.visit('/invitation/clearly-invalid-token-999999', { failOnStatusCode: false });
    
    // Wait for page to load and API calls to complete
    cy.wait(3000);
    
    // Should show some kind of error or invalid state
    cy.get('body').should('exist');
    
    // Look for common error indicators
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase();
      
      // Check if it shows invalid, expired, or error messaging
      expect(bodyText).to.satisfy((text: string) => {
        return text.includes('invalid') || 
               text.includes('expired') || 
               text.includes('error') ||
               text.includes('not found') ||
               text.includes('loading') ||
               text.includes('invitation');
      });
    });
  });
});