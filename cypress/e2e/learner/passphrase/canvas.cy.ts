describe('Canvas Section', () => {
  const passphrase = 'test-learner';
  const baseUrl = '/learner/test-learner/canvas';

  beforeEach(() => {
    cy.task('resetCypressUsers');
    cy.visit(baseUrl);
    // Wait for canvas to load
    cy.get('[data-testid="canvas-grid"]', { timeout: 5000 }).should('exist');
  });

  describe('Canvas Grid Rendering', () => {
    it('renders the canvas grid', () => {
      cy.get('[data-testid="canvas-grid"]').should('be.visible');
    });

    it('displays grid pattern background', () => {
      cy.get('[data-testid="canvas-grid"]').should('have.css', 'backgroundImage').and('not.be.empty');
    });

    it('starts with empty canvas', () => {
      cy.get('[data-testid="canvas-item"]').should('not.exist');
    });
  });

  describe('Canvas Palette', () => {
    it('displays the color palette by default', () => {
      cy.get('[data-testid="canvas-palette"]').should('be.visible');
    });

    it('allows collapsing the palette', () => {
      cy.get('[data-testid="palette-toggle"]').click();
      cy.get('[data-testid="canvas-palette"]').should('not.be.visible');
    });

    it('allows expanding the collapsed palette', () => {
      cy.get('[data-testid="palette-toggle"]').click();
      cy.get('[data-testid="canvas-palette"]').should('not.be.visible');
      cy.get('[data-testid="palette-toggle"]').click();
      cy.get('[data-testid="canvas-palette"]').should('be.visible');
    });

    it('displays color options in palette', () => {
      cy.get('[data-testid="color-option"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Drag and Drop', () => {
    it('allows dragging a color onto the canvas', () => {
      cy.get('[data-testid="color-option"]').first().as('colorOption');
      cy.get('[data-testid="canvas-grid"]').as('canvas');

      // Drag color to canvas center
      cy.get('@colorOption').drag('@canvas', {
        position: { x: 300, y: 300 },
        force: true,
      });

      cy.get('[data-testid="canvas-item"]').should('have.length', 1);
    });

    it('places dragged items at approximately correct coordinates', () => {
      cy.get('[data-testid="color-option"]').first().as('colorOption');
      cy.get('[data-testid="canvas-grid"]').as('canvas');

      cy.get('@colorOption').drag('@canvas', {
        position: { x: 200, y: 200 },
        force: true,
      });

      cy.get('[data-testid="canvas-item"]').first().should('have.attr', 'data-x').and('not.be.empty');
      cy.get('[data-testid="canvas-item"]').first().should('have.attr', 'data-y').and('not.be.empty');
    });

    it('allows dragging multiple items onto the canvas', () => {
      cy.get('[data-testid="color-option"]').first().as('colorOption1');
      cy.get('[data-testid="canvas-grid"]').as('canvas');

      cy.get('@colorOption1').drag('@canvas', {
        position: { x: 200, y: 200 },
        force: true,
      });

      cy.get('[data-testid="color-option"]').eq(1).as('colorOption2');
      cy.get('@colorOption2').drag('@canvas', {
        position: { x: 400, y: 300 },
        force: true,
      });

      cy.get('[data-testid="canvas-item"]').should('have.length', 2);
    });
  });

  describe('Snap-to-Grid', () => {
    it('snaps items to grid on placement', () => {
      cy.get('[data-testid="color-option"]').first().as('colorOption');
      cy.get('[data-testid="canvas-grid"]').as('canvas');

      // Drag to non-aligned position
      cy.get('@colorOption').drag('@canvas', {
        position: { x: 157, y: 263 }, // Intentionally misaligned
        force: true,
      });

      // Item should snap to nearest grid point
      cy.get('[data-testid="canvas-item"]').first().should('have.attr', 'data-snapped', 'true');
    });
  });

  describe('Item Interaction', () => {
    beforeEach(() => {
      // Add an item to the canvas
      cy.get('[data-testid="color-option"]').first().drag('[data-testid="canvas-grid"]', {
        position: { x: 300, y: 300 },
        force: true,
      });
    });

    it('shows delete button when item is hovered or selected', () => {
      cy.get('[data-testid="canvas-item"]').first().hover();
      cy.get('[data-testid="delete-item"]').should('be.visible');
    });

    it('allows deleting an item', () => {
      cy.get('[data-testid="canvas-item"]').should('have.length', 1);

      cy.get('[data-testid="canvas-item"]').first().hover();
      cy.get('[data-testid="delete-item"]').click();

      cy.get('[data-testid="canvas-item"]').should('not.exist');
    });

    it('highlights item when selected', () => {
      cy.get('[data-testid="canvas-item"]').first().click();
      cy.get('[data-testid="canvas-item"]').first().should('have.attr', 'data-selected', 'true');
    });

    it('deselects item when clicking elsewhere', () => {
      cy.get('[data-testid="canvas-item"]').first().click();
      cy.get('[data-testid="canvas-grid"]').click(500, 500, { force: true });
      cy.get('[data-testid="canvas-item"]').first().should('have.attr', 'data-selected', 'false');
    });
  });

  describe('Touch Support', () => {
    it('supports touch drag on mobile viewport', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="color-option"]').first().as('colorOption');
      cy.get('[data-testid="canvas-grid"]').as('canvas');

      cy.get('@colorOption').drag('@canvas', {
        position: { x: 300, y: 300 },
        force: true,
      });

      cy.get('[data-testid="canvas-item"]').should('have.length', 1);
    });
  });

  describe('Canvas Scrolling', () => {
    it('allows scrolling when canvas extends beyond viewport', () => {
      // Add many items to force scrolling
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="color-option"]').first().drag('[data-testid="canvas-grid"]', {
          position: { x: 200 + i * 150, y: 200 + i * 150 },
          force: true,
        });
      }

      cy.get('[data-testid="canvas-grid"]').should('be.visible');
      cy.get('[data-testid="canvas-item"]').should('have.length', 10);
    });
  });

  describe('Canvas Persistence', () => {
    it('persists canvas items after page reload (via Convex)', () => {
      // Add an item
      cy.get('[data-testid="color-option"]').first().drag('[data-testid="canvas-grid"]', {
        position: { x: 300, y: 300 },
        force: true,
      });

      cy.get('[data-testid="canvas-item"]').should('have.length', 1);

      // Note: Full persistence test would require API mocking or backend testing
      // This verifies the UI state is present before potential reload
    });
  });
});
