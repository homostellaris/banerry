'use client'

import React from 'react'
import { ScriptPickerProps, ScriptItem, CANVAS_DATA_NAMES } from './types'

const FALLBACK_SCRIPTS: ScriptItem[] = [
	{ _id: 'fallback-script-1', dialogue: 'I want to play' },
	{ _id: 'fallback-script-2', dialogue: 'Can I have some water?' },
	{ _id: 'fallback-script-3', dialogue: 'Time for break' },
]

export function ScriptPickerModal({
	isOpen,
	scripts = [],
	selectedScriptId,
	onSelectScript,
	onClose,
}: ScriptPickerProps) {
	if (!isOpen) return null

	const displayScripts = scripts.length > 0 ? scripts : FALLBACK_SCRIPTS

	return (
		<div
			data-name={CANVAS_DATA_NAMES.SCRIPT_PICKER_MODAL}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
				onClick={e => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
					<h3 className="text-lg font-bold text-gray-800">Select Script</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 font-bold px-2 text-xl rounded-md"
					>
						×
					</button>
				</div>
				<div className="p-4 overflow-y-auto space-y-2 flex-1">
					{displayScripts.map(script => (
						<div
							key={script._id}
							data-name={CANVAS_DATA_NAMES.SCRIPT_ITEM_OPTION}
							onClick={() => {
								onSelectScript(script)
								onClose()
							}}
							className={`p-3 rounded-lg border cursor-pointer transition-colors ${
								selectedScriptId === script._id
									? 'border-blue-500 bg-blue-50'
									: 'border-gray-200 hover:bg-gray-50'
							}`}
						>
							<div className="text-sm font-medium text-gray-800">
								&quot;{script.dialogue}&quot;
							</div>
							{script.parentheticals && (
								<div className="text-xs text-gray-500 italic mt-0.5">
									({script.parentheticals})
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

