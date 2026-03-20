import type { LoggerProvider } from '@opentelemetry/sdk-logs'

export let loggerProvider: LoggerProvider

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { BatchLogRecordProcessor, LoggerProvider } =
			await import('@opentelemetry/sdk-logs')
		const { OTLPLogExporter } =
			await import('@opentelemetry/exporter-logs-otlp-http')
		const { logs } = await import('@opentelemetry/api-logs')
		const { resourceFromAttributes } = await import('@opentelemetry/resources')

		loggerProvider = new LoggerProvider({
			resource: resourceFromAttributes({ 'service.name': 'banerry' }),
			processors: [
				new BatchLogRecordProcessor(
					new OTLPLogExporter({
						url: 'https://eu.i.posthog.com/i/v1/logs',
						headers: {
							Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`,
							'Content-Type': 'application/json',
						},
					}),
				),
			],
		})

		logs.setGlobalLoggerProvider(loggerProvider)
	}

	if (
		process.env.STUB_APIS === 'true' &&
		process.env.NEXT_RUNTIME === 'nodejs'
	) {
		const { setupServer } = await import('msw/node')
		const { handlers } = await import('./cypress/support/mocks/handlers')

		const server = setupServer(...handlers)
		server.listen({ onUnhandledRequest: 'bypass' })

		console.log('[MSW] Mock server started for Cypress tests')
	}
}
