import './commands'

before(() => {
	cy.task('resetCypressUsers')
	cy.task('clearVerificationCodes')
})
