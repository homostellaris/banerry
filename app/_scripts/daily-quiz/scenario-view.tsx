'use client'

import AudioButton from '@/app/_tts/audio-button'

export default function ScenarioView({
	scenarioText,
	scenarioImageBase64,
}: {
	scenarioText: string
	scenarioImageBase64: string
}) {
	return (
		<div className="flex flex-col items-center gap-4">
			<img
				src={`data:image/png;base64,${scenarioImageBase64}`}
				alt="Quiz scenario"
				className="w-64 h-64 object-cover rounded-xl shadow-md"
			/>
			<div className="flex items-center gap-3">
				<p className="text-lg text-gray-700 text-center max-w-md">
					{scenarioText}
				</p>
				<AudioButton text={scenarioText} />
			</div>
		</div>
	)
}
