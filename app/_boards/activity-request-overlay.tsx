'use client'

import AudioButton from '@/app/_tts/audio-button'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { X } from 'lucide-react'

interface ActivityRequestOverlayProps {
	imageStorageId: Id<'_storage'>
	title: string
	onClose: () => void
}

export function ActivityRequestOverlay({
	imageStorageId,
	title,
	onClose,
}: ActivityRequestOverlayProps) {
	const imageUrl = useQuery(api.boards.getImageUrl, { storageId: imageStorageId })

	return (
		<div
			className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
			onClick={onClose}
		>
			<div
				className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full flex flex-col items-center gap-6 p-8"
				onClick={e => e.stopPropagation()}
			>
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-3 right-3 rounded-full"
					onClick={onClose}
					aria-label="Close"
				>
					<X className="h-5 w-5" />
				</Button>

				{imageUrl ? (
					<img
						src={imageUrl}
						alt={title}
						className="w-full aspect-square object-cover rounded-xl"
					/>
				) : (
					<div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand" />
					</div>
				)}

				<div className="flex items-center gap-4">
					<p className="text-3xl font-bold text-center">{title}</p>
					<AudioButton text={title} />
				</div>
			</div>
		</div>
	)
}
