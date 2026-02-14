import { Card, CardContent } from '@/components/ui/card'
import { Doc } from '@/convex/_generated/dataModel'
import AudioButton from '../_tts/audio-button'
import { Dropdown } from './dropdown'

export default function TargetScriptCard({
	targetScript,
	showDropdown = false,
}: {
	targetScript: Doc<'targetScripts'>
	showDropdown?: boolean
}) {
	return (
		<Card className="h-full overflow-hidden border-2 border-orange-200 bg-orange-50 shadow-md hover:shadow-lg transition-shadow">
			<CardContent className="h-full p-6">
				<div className="h-full flex items-center justify-between">
					<div className="flex items-center gap-2">
						<p className="text-2xl font-bold text-gray-800 pr-4">
							{targetScript.dialogue}
						</p>
					</div>
					<div className="flex items-center">
						<AudioButton text={targetScript.dialogue} />
						{showDropdown && <Dropdown targetScript={targetScript} />}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
