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
				createTestLearner({
					email,
					name,
					bio,
				}: {
					email: string
					name: string
					bio?: string
				}) {
					const args = JSON.stringify({ email, name, bio })
					const result = execSync(
						`bun convex run internal.testing.createTestLearner '${args}'`,
						{ encoding: 'utf-8' },
					)
					return result.trim().replace(/^"|"$/g, '')
				},
			})
		},
		supportFile: 'cypress/support/e2e.ts',
		specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
		viewportWidth: 1280,
		viewportHeight: 720,
		video: false,
		screenshotOnRunFailure: false,
	},
	component: {
		devServer: {
			framework: 'next',
			bundler: 'webpack',
		},
		supportFile: 'cypress/support/component.ts',
		specPattern: 'cypress/component/**/*.cy.{ts,tsx}',
		viewportWidth: 1280,
		viewportHeight: 720,
		video: false,
		screenshotOnRunFailure: false,
	},
})
