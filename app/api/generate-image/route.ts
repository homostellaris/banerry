import { generateImage } from '@/app/_image-generation/image-generation'
import type { ImageStyle } from '@/app/_image-generation/image-generation'

export const maxDuration = 60

export async function POST(request: Request) {
	const { prompt, size, style, referenceImageUrl } = (await request.json()) as {
		prompt: string
		size?: '1024x1024' | '1024x1792' | '1792x1024'
		style?: ImageStyle
		referenceImageUrl?: string
	}

	const result = await generateImage(prompt, size, style, referenceImageUrl)
	return Response.json(result)
}
