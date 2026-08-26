'use client'

import React from 'react'
import {
	BlockPaletteProps,
	BlockType,
	PaletteBlockProps,
	CANVAS_DATA_NAMES,
} from './types'

export function PaletteBlock({
	type,
	label,
	icon,
	onSelect,
}: PaletteBlockProps) {
	return (
		<button
			type="button"
			data-name={`palette-block-${type}`}
			onClick={() => onSelect?.(type)}
			className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-brand/10 hover:border-brand/30 transition-all cursor-pointer group"
		>
			<span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
				{icon || '🧩'}
			</span>
			<span className="text-xs font-bold text-gray-700 group-hover:text-brand">
				{label}
			</span>
		</button>
	)
}

export function BlockPalette({
	onSelectBlockType,
	scripts = [],
	activeBoardColumns = [],
}: BlockPaletteProps) {
	const defaultBlocks: Array<{ type: BlockType; label: string; icon: string }> =
		[
			{ type: 'script', label: `Script ${scripts.length > 0 ? `(${scripts.length})` : ''}`, icon: '💬' },
			{
				type: 'activity',
				label: `Activity ${activeBoardColumns.length > 0 ? `(${activeBoardColumns.length})` : ''}`,
				icon: '🎯',
			},
			{ type: 'emoji', label: 'Emoji', icon: '😀' },
			{ type: 'letter', label: 'Letter', icon: '🔤' },
			{ type: 'number', label: 'Number', icon: '🔢' },
		]

	const getDefaultContent = (type: BlockType): string => {
		switch (type) {
			case 'script':
				return scripts.length > 0 ? scripts[0].dialogue : 'Hello world'
			case 'activity':
				return activeBoardColumns.length > 0 ? activeBoardColumns[0].title : 'Brush Teeth'
			case 'emoji':
				return '😀'
			case 'letter':
				return 'A'
			case 'number':
				return '123'
			default:
				return ''
		}
	}

	return (
		<div
			data-name={CANVAS_DATA_NAMES.BLOCK_PALETTE}
			className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl"
		>
			<h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
				Add Block to Canvas
			</h3>
			<div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
				{defaultBlocks.map(block => (
					<PaletteBlock
						key={block.type}
						type={block.type}
						label={block.label}
						icon={block.icon}
						onSelect={t => onSelectBlockType(t, getDefaultContent(t))}
					/>
				))}
			</div>
		</div>
	)
}

