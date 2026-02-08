import { defineConfig } from 'cypress'
import { execSync } from 'child_process'

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:6604',
		setupNodeEvents(on, config) {
			on('task', {
				resetCypressUsers() {
					execSync('bun convex run internal.testing.resetCypressUsers', {
						stdio: 'inherit',
					})
					return null
				},
				clearVerificationCodes() {
					execSync('bun convex run internal.testing.clearVerificationCodes', {
						stdio: 'inherit',
					})
					return null
				},
			})
		},
		supportFile: 'cypress/support/e2e.ts',
		specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
		viewportWidth: 1280,
		viewportHeight: 720,
		defaultCommandTimeout: 30000,
		pageLoadTimeout: 120000,
		responseTimeout: 60000,
		video: false,
		screenshotOnRunFailure: false,
	},
})
