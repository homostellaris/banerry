import { generateBoardImages } from '@/app/_image-generation/image-generation'
import type { ImageStyle } from '@/app/_image-generation/image-generation'

export const maxDuration = 120

export async function POST(request: Request) {
	const { userPrompt, style, avatarDescription, avatarImageUrl } =
		(await request.json()) as {
			userPrompt: string
			style?: ImageStyle
			avatarDescription?: string
			avatarImageUrl?: string
		}

	const result = await generateBoardImages(
		userPrompt,
		style,
		avatarDescription,
		avatarImageUrl,
	)
	return Response.json(result)
}
