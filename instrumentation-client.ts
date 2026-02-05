import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
	api_host: '/ingest',
	capture_performance: {
		web_vitals: false, // Doesn't work with cookieless mode
	},
	cookieless_mode: 'always',
	ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
	defaults: '2025-11-30',
	capture_exceptions: true,
	debug: process.env.NODE_ENV === 'development',
})

console.debug('instrumentation client loaded')
