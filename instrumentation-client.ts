import posthog from 'posthog-js'

const hasConsent =
	typeof window !== 'undefined' &&
	localStorage.getItem('posthog_consent') === 'true'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
	api_host: '/ingest',
	ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
	capture_exceptions: true,
	debug: process.env.NODE_ENV === 'development',
	...(hasConsent
		? { persistence: 'localStorage+cookie' }
		: { cookieless_mode: 'always' as const }),
})

console.debug('instrumentation client loaded')
