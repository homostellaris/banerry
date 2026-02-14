export async function register() {
	if (
		process.env.STUB_APIS === 'true' &&
		process.env.NEXT_RUNTIME === 'nodejs'
	) {
		const { setupServer } = await import('msw/node')
		const { handlers } = await import('./test-mocks/handlers')

		const server = setupServer(...handlers)
		server.listen({ onUnhandledRequest: 'bypass' })

		console.log('[MSW] Mock server started for Cypress tests')
	}
}
