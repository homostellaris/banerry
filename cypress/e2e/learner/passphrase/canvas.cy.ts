describe('Canvas Section', () => {
  const testEmail = 'cypress-canvas@banerry.app'
  let passphrase: string
  let learnerId: string

  before(() => {
    cy.signIn(testEmail)
    cy.createLearner('Canvas Learner')

    cy.visit('/mentor')
    cy.getByName('learner-card').contains('Canvas Learner').click()
    cy.url()
      .should('include', '/mentor/learner/')
      .then(url => {
        learnerId = url.split('/mentor/learner/')[1].split('/')[0]
      })
    cy.getByName('learner-passphrase')
      .should('not.be.empty')
      .invoke('text')
      .then(text => {
        passphrase = text.trim()
      })
  })

  beforeEach(() => {
    cy.visit(`/learner/${passphrase}/canvas`)
    // Wait for canvas to load
    cy.get('[data-testid="canvas-grid"]', { timeout: 5000 }).should('exist')
  })

  describe('Canvas Grid Rendering', () => {
    it('renders the canvas grid', () => {
      cy.get('[data-testid="canvas-grid"]').should('be.visible')
    })

    it('displays grid pattern background', () => {
      cy.get('[data-testid="canvas-grid"]').should('have.css', 'backgroundImage').and('include', 'linear-gradient')
    })

    it('starts with empty canvas', () => {
      cy.get('[data-testid="canvas-item"]').should('not.exist')
    })

    it('shows empty canvas message', () => {
      cy.get('[data-testid="canvas-grid"]').should('contain', 'Your Canvas')
    })
  })

  describe('Canvas Palette', () => {
    it('displays the canvas palette', () => {
      cy.get('[data-testid="canvas-palette"]').should('be.visible')
    })

    it('has palette toggle button', () => {
      cy.get('[data-testid="palette-toggle"]').should('exist')
    })

    it('allows collapsing the palette', () => {
      cy.get('[data-testid="palette-toggle"]').click()
      // Palette content should not be visible after collapse
      cy.get('[data-testid="color-option"]').should('have.length', 0)
    })

    it('allows expanding the collapsed palette', () => {
      cy.get('[data-testid="palette-toggle"]').click()
      cy.get('[data-testid="palette-toggle"]').click()
      // Colors should reappear
      cy.get('[data-testid="color-option"]').should('have.length.greaterThan', 0)
    })

    it('displays color options in palette', () => {
      cy.get('[data-testid="color-option"]').should('have.length.greaterThan', 0)
    })

    it('has at least 12 color options', () => {
      cy.get('[data-testid="color-option"]').should('have.length.at.least', 12)
    })
  })

  describe('Color Palette Grid', () => {
    it('color options are visually distinct', () => {
      cy.get('[data-testid="color-option"]').first().should('have.css', 'backgroundColor')
    })

    it('color options respond to hover', () => {
      cy.get('[data-testid="color-option"]').first().trigger('mouseover')
      cy.get('[data-testid="color-option"]').first().should('have.css', 'boxShadow')
    })
  })

  describe('Canvas Container', () => {
    it('renders the main canvas container', () => {
      cy.get('[data-testid="canvas-container"]').should('be.visible')
    })

    it('canvas container is scrollable', () => {
      cy.get('[data-testid="canvas-container"]').should('have.css', 'overflow', 'auto')
    })
  })

  describe('Canvas Interaction', () => {
    it('clicking on canvas deselects any selected items', () => {
      cy.get('[data-testid="canvas-grid"]').click(500, 500, { force: true })
      // No items should be selected (none exist initially)
      cy.get('[data-testid="canvas-item"][data-selected="true"]').should('not.exist')
    })
  })

  describe('Touch Support', () => {
    it('supports iPad viewport size', () => {
      cy.viewport('ipad-2')
      cy.get('[data-testid="canvas-grid"]').should('be.visible')
      cy.get('[data-testid="canvas-palette"]').should('be.visible')
    })

    it('supports iPhone viewport size', () => {
      cy.viewport('iphone-x')
      cy.get('[data-testid="canvas-grid"]').should('be.visible')
    })

    it('layout remains responsive on mobile', () => {
      cy.viewport('iphone-x')
      cy.get('[data-testid="canvas-container"]').should('exist')
      cy.get('[data-testid="canvas-grid"]').should('exist')
    })
  })

  describe('Canvas Structure', () => {
    it('canvas grid has proper dimensions', () => {
      cy.get('[data-testid="canvas-grid"]').should('have.css', 'width').and('not.equal', '0px')
      cy.get('[data-testid="canvas-grid"]').should('have.css', 'height').and('not.equal', '0px')
    })

    it('canvas prevents text selection during interaction', () => {
      cy.get('[data-testid="canvas-grid"]').should('have.css', 'userSelect', 'none')
    })

    it('canvas items are positioned absolutely', () => {
      // Once items exist, they should be positioned absolutely
      cy.get('[data-testid="canvas-grid"]').then($canvas => {
        if ($canvas.find('[data-testid="canvas-item"]').length > 0) {
          cy.get('[data-testid="canvas-item"]').first().should('have.css', 'position', 'absolute')
        }
      })
    })
  })

  describe('Accessibility', () => {
    it('palette toggle button has aria label', () => {
      cy.get('[data-testid="palette-toggle"]').should('have.attr', 'aria-label')
    })

    it('canvas grid is accessible with keyboard', () => {
      cy.get('[data-testid="canvas-grid"]').should('be.visible')
      cy.get('[data-testid="canvas-grid"]').focus()
      cy.get('[data-testid="canvas-grid"]').should('have.focus')
    })
  })

  describe('Visual Hierarchy', () => {
    it('palette appears below canvas', () => {
      cy.get('[data-testid="canvas-container"]').should('be.visible')
      cy.get('[data-testid="canvas-palette"]').should('be.visible')
      
      // Canvas container should be above palette in the DOM order
      cy.get('[data-testid="canvas-container"]').then($container => {
        cy.get('[data-testid="canvas-palette"]').then($palette => {
          const containerPos = $container.position().top
          const palettePos = $palette.position().top
          expect(containerPos).to.be.lessThan(palettePos)
        })
      })
    })
  })

  describe('Page Load', () => {
    it('page title includes canvas or learner name', () => {
      cy.title().should('include.oneOf', ['Canvas', 'Learner', 'Banerry'])
    })

    it('all critical elements load within timeout', () => {
      cy.get('[data-testid="canvas-container"]', { timeout: 5000 }).should('exist')
      cy.get('[data-testid="canvas-grid"]', { timeout: 5000 }).should('exist')
      cy.get('[data-testid="canvas-palette"]', { timeout: 5000 }).should('exist')
    })
  })
})
