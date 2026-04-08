'use client'
import posthog, { DisplaySurveyType } from 'posthog-js'
import { CircleHelp, Mail, MessageCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

const WHATSAPP_GROUP_URL =
	'https://chat.whatsapp.com/DGzxPJQAJ8CAZIM1bivux2?mode=gi_t'

export default function HelpPopover() {
	function openFeedbackSurvey() {
		posthog.surveys.getSurveys(surveys => {
			if (surveys.length > 0) {
				posthog.displaySurvey(surveys[0].id, {
					ignoreConditions: true,
					ignoreDelay: true,
					displayType: DisplaySurveyType.Popover,
				})
			}
		}, true)
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Help"
					data-name="help-popover-trigger"
					className="text-gray-600 hover:text-brand"
				>
					<CircleHelp className="h-6 w-6" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-44 p-1"
			>
				<div className="flex flex-col">
					<Button
						variant="ghost"
						className="justify-start"
						asChild
					>
						<a
							href="mailto:mrdanielmetcalfe+banerry@gmail.com"
							data-name="help-link"
						>
							<Mail className="h-4 w-4" />
							Help
						</a>
					</Button>
					<Button
						variant="ghost"
						className="justify-start"
						onClick={openFeedbackSurvey}
						data-name="feedback-button"
					>
						<MessageSquare className="h-4 w-4" />
						Feedback
					</Button>
					<Button
						variant="ghost"
						className="justify-start"
						asChild
					>
						<a
							href={WHATSAPP_GROUP_URL}
							target="_blank"
							rel="noopener noreferrer"
							data-name="whatsapp-link"
						>
							<MessageCircle className="h-4 w-4" />
							WhatsApp
						</a>
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}
