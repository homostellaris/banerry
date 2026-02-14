import type { ImageStyle } from './image-generation'

export const stylePrompts: Record<ImageStyle, string> = {
	'studio-ghibli': `{{USER_PROMPT}}

For this image use a digital art style, vibrant colour palette, soft volumetric lighting, inspired by Studio Ghibli, style and colour palette heavily influenced by included reference images.`,

	'play-doh': `{{USER_PROMPT}}

For this image use a play-Doh style, vibrant colours, soft tactile textures, clean lines, style and colour palette heavily influenced by included reference images.`,

	ladybird: `{{USER_PROMPT}}

For this image use a classic Ladybird Books illustration style, 1960s British children's book aesthetic, detailed figurative painting, vibrant and clean colours, utopian atmosphere, precise drawing, style and colour palette heavily influenced by included reference images.`,

	symbols: `{{USER_PROMPT}}

Simple AAC-style symbol. Clear black outlines, flat solid colors, minimal detail, centered on white background, no text or labels. Similar to Widgit or PCS symbols. Single clear action or object, easy to understand at a glance.`,
}
