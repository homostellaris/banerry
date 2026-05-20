import Navigation from '@/app/_common/navigation'

it('shows dropdown trigger on mobile with active section name', () => {
	cy.viewport(375, 812)
	cy.mount(<Navigation basePath="/learner/test" />)
	cy.get('button').contains('Scripts').should('exist')
})

it('opens dropdown listing all sections on mobile', () => {
	cy.viewport(375, 812)
	cy.mount(<Navigation basePath="/learner/test" />)
	cy.get('button').contains('Scripts').click()
	cy.contains('Boards').should('be.visible')
	cy.contains('Activities').should('be.visible')
	cy.contains('Timer').should('be.visible')
	cy.contains('Canvas').should('be.visible')
})

it('shows tab links on desktop', () => {
	cy.viewport(1280, 720)
	cy.mount(<Navigation basePath="/learner/test" />)
	cy.get('a').contains('Scripts').should('be.visible')
	cy.get('a').contains('Boards').should('be.visible')
	cy.get('a').contains('Activities').should('be.visible')
})

it('renders only link tabs (no dropdown trigger button) on desktop', () => {
	cy.viewport(1280, 720)
	cy.mount(<Navigation basePath="/learner/test" />)
	cy.get('a[href$="/scripts"]').should('exist')
	cy.get('a[href$="/boards"]').should('exist')
})
