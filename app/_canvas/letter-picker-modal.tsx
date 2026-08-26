'use client'

import React from 'react'
import { LetterPickerProps, LETTER_OPTIONS, CANVAS_DATA_NAMES } from './types'

export function LetterPickerModal({
	isOpen,
	selectedLetter,
	onSelectLetter,
	onClose,
}: LetterPickerProps) {
	if (!isOpen) return null

	return (
		<div
			data-name={CANVAS_DATA_NAMES.LETTER_PICKER_MODAL}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
				onClick={e => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
					<h3 className="text-lg font-bold text-gray-800">Select Letter</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 font-bold px-2 text-xl rounded-md"
					>
						×
					</button>
				</div>
				<div className="p-4 overflow-y-auto grid grid-cols-6 gap-2 flex-1">
					{LETTER_OPTIONS.map(letter => (
						<button
							key={letter}
							type="button"
							data-name={CANVAS_DATA_NAMES.LETTER_ITEM_OPTION}
							onClick={() => {
								onSelectLetter(letter)
								onClose()
							}}
							className={`text-2xl font-bold p-3 rounded-lg border flex items-center justify-center hover:bg-purple-50 transition-colors ${
								selectedLetter === letter
									? 'border-purple-500 bg-purple-50 ring-2 ring-purple-400 text-purple-700'
									: 'border-gray-200 text-gray-800'
							}`}
						>
							{letter}
						</button>
					))}
				</div>
			</div>
		</div>
	)
}
