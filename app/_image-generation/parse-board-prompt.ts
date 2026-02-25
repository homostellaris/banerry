'use server'

import { generateObject } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { z } from 'zod'

const parsedColumnSchema = z.object({
	title: z.string(),
	prompt: z.string(),
})

const parsedBoardPromptSchema = z.object({
	boardName: z.string(),
	characterDescription: z.string(),
	styleConsistency: z.string(),
	columns: z.array(parsedColumnSchema).min(1),
})

export type ParsedColumn = z.infer<typeof parsedColumnSchema>
export type ParsedBoardPrompt = z.infer<typeof parsedBoardPromptSchema>

const SYSTEM_PROMPT = `You are an expert at creating detailed, consistent image prompts for AI image generation that will be used in a visual schedule board for children.

Your goal is to analyze the user's routine description and create the appropriate number of image prompts showing the EXACT SAME CHARACTER doing different activities. Character consistency is CRITICAL.

IMPORTANT: Determine the number of steps/columns based on the user's input. Don't assume 3 - use as many as needed (typically 1-6 steps).

When creating character descriptions, you MUST specify ALL of these attributes:
- Exact age (e.g., "7-year-old")
- Gender and ethnicity/skin tone
- Hair: exact color, length, style (e.g., "short curly auburn hair")
- Eyes: color
- Face: any distinctive features
- Body type: height/build for age
- Clothing: EXACT outfit with specific colors and patterns (e.g., "red striped t-shirt, dark blue jeans, white sneakers")

IMPORTANT RULES FOR CONSISTENCY:
1. The character description must be IDENTICAL word-for-word in all prompts
2. Use the SAME camera angle (medium shot, eye-level) for all images
3. Use the SAME lighting (soft natural daylight)
4. Keep backgrounds simple and slightly blurred to focus on the character
5. The character should be centered and fill about 60% of the frame
6. Facial expression should be calm and content in all images

Each activity prompt should follow this structure:
"[Full character description]. The child is [doing activity]. [Simple background]. Medium shot, eye-level angle, soft natural lighting, centered composition."

Respond in JSON format only.`

const USER_PROMPT_TEMPLATE = `Parse this routine description into image prompts for a visual schedule:

"{{USER_INPUT}}"

{{CHARACTER_INSTRUCTION}}

Analyze the routine and determine the appropriate number of steps. Create a column for each distinct step mentioned or implied.

Respond with this exact JSON structure:
{
  "boardName": "short 2-4 word name for the routine",
  "characterDescription": "{{CHARACTER_DESCRIPTION_INSTRUCTION}}",
  "styleConsistency": "Medium shot, eye-level camera angle, soft natural daylight, simple blurred background, centered composition, children's book illustration style",
  "columns": [
    {
      "title": "Short title for step 1 (1-3 words)",
      "prompt": "Complete prompt starting with the full character description, then the activity"
    },
    {
      "title": "Short title for step 2 (1-3 words)",
      "prompt": "Complete prompt starting with the SAME character description, then the activity"
    }
  ]
}

CRITICAL:
- The character description text must appear IDENTICALLY at the start of each column prompt.
- Create the appropriate number of columns based on the steps mentioned (can be 1-10 columns).
- Each title should be concise (1-3 words like "Wake Up", "Brush Teeth", "Eat Breakfast").`

const CHARACTER_INSTRUCTION_WITH_AVATAR = `Use this exact character description for all images: "{{AVATAR_DESCRIPTION}}"`

const CHARACTER_INSTRUCTION_WITHOUT_AVATAR = `Create a HIGHLY DETAILED character description that will ensure the same character appears in all images.`

const CHARACTER_DESCRIPTION_INSTRUCTION_WITH_AVATAR = `Use EXACTLY: {{AVATAR_DESCRIPTION}}`

const CHARACTER_DESCRIPTION_INSTRUCTION_WITHOUT_AVATAR = `VERY detailed character description with exact age, ethnicity, hair color/style, eye color, specific clothing with colors - this EXACT text will be copied into each prompt`

export async function parseBoardPrompt(
	userPrompt: string,
	avatarDescription?: string,
): Promise<
	{ success: true; data: ParsedBoardPrompt } | { success: false; error: string }
> {
	if (!userPrompt.trim()) {
		return {
			success: false,
			error: 'Please enter a routine description',
		}
	}

	let userPromptContent = USER_PROMPT_TEMPLATE.replace(
		'{{USER_INPUT}}',
		userPrompt,
	)

	if (avatarDescription) {
		userPromptContent = userPromptContent
			.replace(
				'{{CHARACTER_INSTRUCTION}}',
				CHARACTER_INSTRUCTION_WITH_AVATAR.replace(
					'{{AVATAR_DESCRIPTION}}',
					avatarDescription,
				),
			)
			.replace(
				'{{CHARACTER_DESCRIPTION_INSTRUCTION}}',
				CHARACTER_DESCRIPTION_INSTRUCTION_WITH_AVATAR.replace(
					'{{AVATAR_DESCRIPTION}}',
					avatarDescription,
				),
			)
	} else {
		userPromptContent = userPromptContent
			.replace(
				'{{CHARACTER_INSTRUCTION}}',
				CHARACTER_INSTRUCTION_WITHOUT_AVATAR,
			)
			.replace(
				'{{CHARACTER_DESCRIPTION_INSTRUCTION}}',
				CHARACTER_DESCRIPTION_INSTRUCTION_WITHOUT_AVATAR,
			)
	}

	try {
		const result = await generateObject({
			model: gateway('google/gemini-2.5-flash'),
			schema: parsedBoardPromptSchema,
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: userPromptContent },
			],
			temperature: 0.7,
		})

		return {
			success: true,
			data: result.object,
		}
	} catch (error) {
		console.error('Error parsing board prompt:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to parse prompt',
		}
	}
}
