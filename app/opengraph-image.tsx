import { readFileSync } from 'fs'
import { join } from 'path'
import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'Banerry'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
	const logoData = readFileSync(join(process.cwd(), 'public/icon-512x512.png'))
	const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`

	return new ImageResponse(
		(
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: '100%',
					height: '100%',
					backgroundColor: '#ffffff',
					gap: 48,
					padding: 80,
				}}
			>
				<img
					src={logoBase64}
					width={240}
					height={240}
					alt="Banerry logo"
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 16,
					}}
				>
					<div
						style={{
							fontSize: 80,
							fontWeight: 700,
							color: '#11932F',
							letterSpacing: '-2px',
						}}
					>
						Banerry
					</div>
					<div
						style={{
							fontSize: 32,
							color: '#555555',
							maxWidth: 580,
							lineHeight: 1.4,
						}}
					>
						Communication assistance for visual and gestalt language learners.
					</div>
				</div>
			</div>
		),
		{ width: 1200, height: 630 },
	)
}
