import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'public/logo.svg')
const svgBuffer = readFileSync(svgPath)

async function generateIcon(outputPath, size, { maskable = false } = {}) {
	const padding = maskable ? Math.round(size * 0.1) : 0
	const logoSize = size - padding * 2

	const resized = sharp(svgBuffer).resize(logoSize, logoSize, {
		fit: 'contain',
		background: { r: 0, g: 0, b: 0, alpha: 0 },
	})

	let composed
	if (maskable) {
		const logoBuffer = await resized.png().toBuffer()
		composed = sharp({
			create: {
				width: size,
				height: size,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			},
		})
			.composite([{ input: logoBuffer, gravity: 'centre' }])
			.png()
	} else {
		composed = resized.png()
	}

	await composed.toFile(resolve(root, outputPath))
	console.log(`Generated ${outputPath} (${size}x${size})`)
}

async function generateFavicon(outputPath, size) {
	const buffer = await sharp(svgBuffer)
		.resize(size, size, {
			fit: 'contain',
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		})
		.png()
		.toBuffer()

	writeFileSync(resolve(root, outputPath), buffer)
	console.log(`Generated ${outputPath} (${size}x${size})`)
}

await Promise.all([
	generateIcon('public/icon-192x192.png', 192),
	generateIcon('public/icon-512x512.png', 512),
	generateIcon('public/icon-maskable-192x192.png', 192, { maskable: true }),
	generateIcon('public/icon-maskable-512x512.png', 512, { maskable: true }),
	generateIcon('public/apple-touch-icon.png', 180, { maskable: true }),
	generateFavicon('public/favicon.ico', 32),
])

console.log('All icons generated.')
