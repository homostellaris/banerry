import { defineConfig } from 'cypress'
import { execSync } from 'child_process'
import fs from 'fs'

const envFlag = fs.existsSync('.env.test.local')
	? '--env-file .env.test.local '
	: ''

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:6604',
		setupNodeEvents(on, config) {
			on('task', {
				resetCypressUsers() {
					execSync(
						`bunx convex run ${envFlag}internal.testing.resetCypressUsers`,
						{
							stdio: 'inherit',
						},
					)
					return null
				},
				clearVerificationCodes() {
					execSync(
						`bunx convex run ${envFlag}internal.testing.clearVerificationCodes`,
						{
							stdio: 'inherit',
						},
					)
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
						`bunx convex run ${envFlag}internal.testing.createTestLearner '${args}'`,
						{ encoding: 'utf-8' },
					)
					const raw = result.trim()
					try {
						return JSON.parse(raw)
					} catch {
						try {
							return Function('"use strict";return (' + raw + ')')()
						} catch {
							return raw.replace(/^"|"$/g, '')
						}
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
