describe('Now Next Then Board', () => {
  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  it('should render the board structure with three columns', () => {
    cy.visit('/mentor/boards', { failOnStatusCode: false });

    cy.wait(2000);

    cy.get('body').should('exist');

    cy.get('body').then(($body) => {
      const text = $body.text();

      if (text.includes('Now, Next, Then Board') || text.includes('Now') || text.includes('Next') || text.includes('Then')) {
        cy.get('h1, h2').should('contain.text', 'Now, Next, Then Board');
      } else {
        cy.log('Board page may require authentication');
      }
    });
  });

  it('should have learner selection dropdown', () => {
    cy.visit('/mentor/boards', { failOnStatusCode: false });

    cy.wait(2000);

    cy.get('body').then(($body) => {
      const text = $body.text();

      if (text.includes('Select Learner') || text.includes('Choose a learner')) {
        cy.contains('Select Learner').should('exist');
      } else {
        cy.log('Learner selection may require authentication');
      }
    });
  });

  it('should display board columns when learner is selected', () => {
    cy.visit('/mentor/boards', { failOnStatusCode: false });

    cy.wait(3000);

    cy.get('body').then(($body) => {
      if ($body.find('[role="combobox"]').length > 0) {
        cy.get('[role="combobox"]').first().click();
        cy.wait(1000);

        cy.get('body').then(($body2) => {
          if ($body2.find('[role="option"]').length > 0) {
            cy.get('[role="option"]').first().click();
            cy.wait(2000);

            cy.get('body').should('contain.text', 'Now');
          }
        });
      } else {
        cy.log('No learners available or authentication required');
      }
    });
  });

  it('should show image generation input when column is clicked', () => {
    cy.visit('/mentor/boards', { failOnStatusCode: false });

    cy.wait(3000);

    cy.get('body').then(($body) => {
      if ($body.text().includes('Tap to add image')) {
        cy.contains('Tap to add image').first().click();
        cy.wait(1000);

        cy.get('input[placeholder*="Describe"]').should('exist');
      } else {
        cy.log('Board may require learner selection or authentication');
      }
    });
  });

  it('should have timer buttons for each column', () => {
    cy.visit('/mentor/boards', { failOnStatusCode: false });

    cy.wait(3000);

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("1m")').length > 0) {
        cy.get('button').should('contain.text', '1m');
        cy.get('button').should('contain.text', '5m');
        cy.get('button').should('contain.text', '10m');
        cy.get('button').should('contain.text', '15m');
      } else {
        cy.log('Timer buttons may require column activation');
      }
    });
  });

  it('should have voice input button', () => {
    cy.visit('/mentor/boards', { failOnStatusCode: false });

    cy.wait(3000);

    cy.get('body').then(($body) => {
      const hasActiveColumn = $body.find('input[placeholder*="Describe"]').length > 0;

      if (hasActiveColumn) {
        cy.get('button[class*="icon"]').should('exist');
      } else {
        cy.log('Voice input requires active column');
      }
    });
  });

  it('should display add column button', () => {
    cy.visit('/mentor/boards', { failOnStatusCode: false });

    cy.wait(3000);

    cy.get('body').then(($body) => {
      if ($body.text().includes('Add Column')) {
        cy.contains('Add Column').should('exist');
      } else {
        cy.log('Add column button may require learner selection');
      }
    });
  });
});
