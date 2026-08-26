'use client'

import React from 'react'
import { EmojiPickerProps, EMOJI_OPTIONS, CANVAS_DATA_NAMES } from './types'

export function EmojiPickerModal({
	isOpen,
	selectedEmoji,
	onSelectEmoji,
	onClose,
}: EmojiPickerProps) {
	if (!isOpen) return null

	return (
		<div
			data-name={CANVAS_DATA_NAMES.EMOJI_PICKER_MODAL}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
				onClick={e => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
					<h3 className="text-lg font-bold text-gray-800">Select Emoji</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 font-bold px-2 text-xl rounded-md"
					>
						×
					</button>
				</div>
				<div className="p-4 overflow-y-auto grid grid-cols-5 gap-3 flex-1">
					{EMOJI_OPTIONS.map(emoji => (
						<button
							key={emoji}
							type="button"
							data-name={CANVAS_DATA_NAMES.EMOJI_ITEM_OPTION}
							onClick={() => {
								onSelectEmoji(emoji)
								onClose()
							}}
							className={`text-3xl p-3 rounded-lg border flex items-center justify-center hover:bg-brand/10 transition-colors ${
								selectedEmoji === emoji
									? 'border-brand bg-brand/10 ring-2 ring-brand/30'
									: 'border-gray-200'
							}`}
						>
							{emoji}
						</button>
					))}
				</div>
			</div>
		</div>
	)
}
