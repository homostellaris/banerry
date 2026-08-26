import './commands'

let consoleErrors: string[] = []

before(() => {
	cy.task('resetCypressUsers')
	cy.task('clearVerificationCodes')
})

beforeEach(() => {
	consoleErrors = []
	Cypress.on('window:before:load', (win) => {
		const originalError = win.console.error
		win.console.error = (...args: any[]) => {
			consoleErrors.push(args.map(a => String(a)).join(' '))
			originalError(...args)
		}
	})
})

afterEach(() => {
	const criticalErrors = consoleErrors.filter((msg: string) =>
		/Minified React error|rules-of-hooks|Rendered fewer hooks than expected|Rendered more hooks than expected|Invalid hook call|hydration failed|Text content did not match/i.test(
			msg,
		),
	)
	expect(
		criticalErrors,
		`Detected critical React runtime/hydration errors in console:\n${criticalErrors.join('\n')}`,
	).to.have.length(0)
})
