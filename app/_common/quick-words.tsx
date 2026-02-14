'use client'

import TextButton from '@/app/_tts/text-button'

const QUICK_WORDS = [
	'yes',
	'no',
	'help',
	'thank you',
	'please',
	'more',
	'stop',
	'water',
	'bathroom',
	'hungry',
	'tired',
	'finished',
	'good',
	'bad',
	'sorry',
	'hi',
	'bye',
]

export default function QuickWords() {
	return (
		<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none hover:scrollbar-thin hover:scrollbar-thumb-gray-300 hover:scrollbar-track-transparent">
			{QUICK_WORDS.map(word => (
				<TextButton
					key={word}
					text={word}
					className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 text-gray-800 font-medium capitalize whitespace-nowrap text-sm"
				/>
			))}
		</div>
	)
}
