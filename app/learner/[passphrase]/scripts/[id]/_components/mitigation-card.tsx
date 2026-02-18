import AudioButton from '@/app/_tts/audio-button'
import { Card, CardContent } from '@/components/ui/card'

interface MitigationProps {
	mitigation: {
		id: string
		text: string
		explanation: string
	}
	originalScript: string
}

export default function MitigationCard({
	mitigation,
	originalScript,
}: MitigationProps) {
	return (
		<Card className="overflow-hidden border-2 border-green-200 shadow-md">
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<h3 className="text-2xl font-bold text-gray-800 pr-4">
						{highlightMatchingWords(mitigation.text, originalScript)}
					</h3>
					<AudioButton text={mitigation.text} />
				</div>
			</CardContent>
		</Card>
	)
}

const highlightMatchingWords = (
	mitigationText: string,
	originalText: string,
) => {
	// Convert both texts to lowercase and split into words
	const originalWords = originalText.toLowerCase().split(/\s+/).filter(Boolean)

	// Create a Set for faster lookups
	const originalWordsSet = new Set(originalWords)

	// Split the mitigation text into words while preserving punctuation
	// This regex captures words and punctuation separately
	const mitigationParts = mitigationText
		.split(/(\s+|[.,!?;:'"()-])/g)
		.filter(Boolean)

	return (
		<>
			{mitigationParts.map((part, index) => {
				// Check if this part is a word (not whitespace or punctuation)
				const isWord = !/^\s+$/.test(part) && !/^[.,!?;:'"()-]$/.test(part)

				if (isWord && originalWordsSet.has(part.toLowerCase())) {
					// If it's a word that appears in the original script, highlight it
					return (
						<span
							key={index}
							className="text-brand font-medium"
						>
							{part}
						</span>
					)
				} else {
					// Otherwise, render it normally
					return <span key={index}>{part}</span>
				}
			})}
		</>
	)
}
