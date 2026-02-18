'use server'

import { parseBoardPrompt, ParsedBoardPrompt } from './parse-board-prompt'
import { generateImageWithGemini } from './gemini'

export type ImageStyle = 'studio-ghibli' | 'play-doh' | 'ladybird' | 'symbols'

export type GenerationProgress = {
	step: 'parsing' | 'generating'
	currentColumnIndex?: number
	totalColumns?: number
	completedColumns: number
}

export type BoardImageResult = {
	columnId: string
	title: string
	imageData: string
	prompt: string
}

export type GenerateBoardImagesResult =
	| {
			success: true
			boardName: string
			images: BoardImageResult[]
			parsedPrompt: ParsedBoardPrompt
	  }
	| {
			success: false
			error: string
			partialImages?: BoardImageResult[]
	  }

export async function generateImage(
	prompt: string,
	size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024',
	style: ImageStyle = 'studio-ghibli',
	referenceImageUrl?: string,
) {
	console.log(
		`Generating image for prompt: "${prompt}" with style: ${style}${referenceImageUrl ? ' (with reference)' : ''}`,
	)

	const result = await generateImageWithGemini(prompt, style, referenceImageUrl)

	if (!result.success) {
		return result
	}

	return {
		success: true as const,
		imageData: result.imageData,
		originalPrompt: prompt,
		size: size,
	}
}

function buildEnhancedPrompt(
	basePrompt: string,
	avatarDescription: string | undefined,
	styleConsistency: string,
	style: ImageStyle,
	hasReferenceImage: boolean,
): string {
	let enhanced = basePrompt

	if (hasReferenceImage && style !== 'symbols') {
		enhanced = `Using the character from the reference image as the main character, generate an image of them: ${enhanced}`
	} else if (avatarDescription && style !== 'symbols') {
		enhanced = `The main character is: ${avatarDescription}. ${enhanced}`
	}

	if (styleConsistency) {
		enhanced = `${enhanced} ${styleConsistency}`
	}

	if (hasReferenceImage) {
		enhanced +=
			' The character must match the reference image exactly - same appearance, clothing, and style.'
	} else {
		enhanced += ' Ensure this exact character appears consistently.'
	}

	enhanced += ' Do not add any text, words, or labels to the image.'

	return enhanced
}

export async function generateBoardImages(
	userPrompt: string,
	style: ImageStyle = 'studio-ghibli',
	avatarDescription?: string,
	avatarImageUrl?: string,
): Promise<GenerateBoardImagesResult> {
	const parseResult = await parseBoardPrompt(userPrompt, avatarDescription)

	if (!parseResult.success) {
		return {
			success: false,
			error: parseResult.error,
		}
	}

	const { data: parsedPrompt } = parseResult
	const images: BoardImageResult[] = []

	const hasReferenceImage = !!avatarImageUrl && style !== 'symbols'
	const effectiveAvatarDescription =
		style === 'symbols'
			? undefined
			: (avatarDescription ?? parsedPrompt.characterDescription)

	const imageResults = await Promise.all(
		parsedPrompt.columns.map(async (column, i) => {
			const columnId = `column-${Date.now()}-${i}`

			const enhancedPrompt = buildEnhancedPrompt(
				column.prompt,
				effectiveAvatarDescription,
				parsedPrompt.styleConsistency,
				style,
				hasReferenceImage,
			)

			const result = await generateImage(
				enhancedPrompt,
				'1024x1024',
				style,
				hasReferenceImage ? avatarImageUrl : undefined,
			)

			return { result, column, columnId, enhancedPrompt }
		}),
	)

	for (const { result, column, columnId, enhancedPrompt } of imageResults) {
		if (!result.success) {
			return {
				success: false,
				error: `Failed to generate image for "${column.title}": ${result.error}`,
				partialImages: images,
			}
		}

		images.push({
			columnId,
			title: column.title,
			imageData: result.imageData!,
			prompt: enhancedPrompt,
		})
	}

	return {
		success: true,
		boardName: parsedPrompt.boardName,
		images,
		parsedPrompt,
	}
}
