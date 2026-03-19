import type { NextConfig } from 'next'
import createWithVercelToolbar from '@vercel/toolbar/plugins/next'

const nextConfig: NextConfig = {
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals = config.externals || []
			config.externals.push('msw', 'msw/node', '@mswjs/interceptors')
		} else {
			// Polyfill node:events for browser bundles (needed by ElevenLabs SDK
			// when bundled in component tests via Cypress webpack)
			config.resolve.alias = {
				...config.resolve.alias,
				'node:events': 'events',
			}
		}
		return config
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '10mb',
		},
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	async rewrites() {
		return [
			{
				source: '/ingest/static/:path*',
				destination: 'https://eu-assets.i.posthog.com/static/:path*',
			},
			{
				source: '/ingest/:path*',
				destination: 'https://eu.i.posthog.com/:path*',
			},
		]
	},
	skipTrailingSlashRedirect: true,
}

const withVercelToolbar = createWithVercelToolbar()
export default withVercelToolbar(nextConfig)
