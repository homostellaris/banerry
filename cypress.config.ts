import { defineConfig } from 'cypress'
import { execSync } from 'child_process'

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:6604',
		setupNodeEvents(on, config) {
			on('task', {
				resetCypressUsers() {
					try {
						execSync('bun convex run internal.testing.resetCypressUsers', {
							stdio: 'inherit',
						})
					} catch (error) {
						console.warn('⚠️  resetCypressUsers skipped - Convex auth not available')
					}
					return null
				},
				clearVerificationCodes() {
					try {
						execSync('bun convex run internal.testing.clearVerificationCodes', {
							stdio: 'inherit',
						})
					} catch (error) {
						console.warn('⚠️  clearVerificationCodes skipped - Convex auth not available')
					}
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
					try {
						const args = JSON.stringify({ email, name, bio })
						const result = execSync(
							`bun convex run internal.testing.createTestLearner '${args}'`,
							{ encoding: 'utf-8' },
						)
						return result.trim().replace(/^"|"$/g, '')
					} catch (error) {
						console.warn('⚠️  createTestLearner skipped - Convex auth not available')
						return 'test-learner'
					}
				},
			})
		},
		supportFile: 'cypress/support/e2e.ts',
		specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
		viewportWidth: 1280,
		viewportHeight: 720,
		video: true,
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
