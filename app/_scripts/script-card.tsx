import { Card, CardContent } from '@/components/ui/card'
import { Doc } from '@/convex/_generated/dataModel'
import AudioButton from '../_tts/audio-button'
import { Dropdown } from './dropdown'

export default function ScriptCard({
	script,
	showDropdown = false,
	className,
}: {
	script: { dialogue: string; parentheticals?: string } | Doc<'scripts'>
	showDropdown?: boolean
	className?: string
}) {
	return (
		<Card
			className={`overflow-hidden border-2 border-brand/20 shadow-md hover:shadow-lg transition-shadow rounded-xl ${className || ''}`}
			data-name="script-card"
		>
			<CardContent className="p-4 sm:p-5 h-full flex flex-col justify-between">
				<div className="flex items-center justify-between gap-4 h-full">
					<h3 className="text-left text-xl sm:text-2xl font-bold text-gray-800 flex-1 break-words">
						{script.dialogue}
					</h3>
					<div className="flex items-center shrink-0">
						<AudioButton
							text={script.dialogue}
							className="rounded-full h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 bg-brand/10 hover:bg-brand/20 text-brand"
							iconClassName="h-6 w-6 sm:h-7 sm:w-7 text-brand"
						/>
						{showDropdown && 'parentheticals' in script && <Dropdown script={script as Doc<'scripts'>} />}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
