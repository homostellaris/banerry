import { VoiceProvider } from '@/app/_tts/voice-context'
import { TimerProvider } from '@/app/_common/timer-context'
import { FloatingTimerCard } from '@/app/_common/floating-timer-card'
import PostHogClientProvider from '@/app/_posthog/provider'
import '@/app/globals.css'
import ConvexClientProvider from '@/components/ConvexClientProvider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Lexend } from 'next/font/google'
import type React from 'react'

const lexend = Lexend({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: {
		default: 'Banerry',
		template: '%s | Banerry',
	},
	description:
		'Communication assistance for visual and gestalt language learners.',
	keywords: [
		'PWA',
		'Gestalt Language Processing',
		'Language Development',
		'Communication',
	],
	authors: [{ name: 'Banerry Team' }],
	creator: 'Banerry',
	publisher: 'Banerry',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(
		process.env.VERCEL_PROJECT_PRODUCTION_URL
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: 'http://localhost:6604',
	),
	alternates: {
		canonical: '/',
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: process.env.VERCEL_PROJECT_PRODUCTION_URL
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: 'http://localhost:6604',
		title: 'Banerry',
		description:
			'Communication assistance for visual and gestalt language learners.',
		siteName: 'Banerry',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Banerry',
		description:
			'Communication assistance for visual and gestalt language learners.',
		images: ['/og-image.png'],
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Banerry',
		startupImage: [
			'/apple-touch-startup-image-768x1004.png',
			{
				url: '/apple-touch-startup-image-1536x2008.png',
				media: '(device-width: 768px) and (device-height: 1024px)',
			},
		],
	},
	other: {
		'mobile-web-app-capable': 'yes',
		'apple-mobile-web-app-capable': 'yes',
		'apple-mobile-web-app-status-bar-style': 'black-translucent',
		'msapplication-TileColor': '#11932F',
		'msapplication-config': '/browserconfig.xml',
	},
	generator: 'v0.dev',
}

export const viewport: Viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#11932F' },
	],
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<ConvexAuthNextjsServerProvider>
			<html
				lang="en"
				suppressHydrationWarning
			>
				<link
					rel="icon"
					href="/logo.svg"
					type="image/svg+xml"
				/>
				<link
					rel="icon"
					href="/favicon.ico"
					sizes="32x32"
				/>
				<link
					rel="apple-touch-icon"
					href="/apple-touch-icon.png"
				/>
				<meta
					name="theme-color"
					content="#11932F"
				/>
				<body className={lexend.className}>
					<PostHogClientProvider>
						<ConvexClientProvider>
							<ThemeProvider
								attribute="class"
								defaultTheme="light"
								enableSystem
								disableTransitionOnChange
							>
								<VoiceProvider>
									<TimerProvider>
										{children}
										<FloatingTimerCard />
										{/* <SettingsMenu /> */}
										<Analytics />
									</TimerProvider>
								</VoiceProvider>
								<Toaster position="top-center" />
							</ThemeProvider>
						</ConvexClientProvider>
					</PostHogClientProvider>
				</body>
			</html>
		</ConvexAuthNextjsServerProvider>
	)
}
