'use client'

import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { ChevronDown, ChevronUp, ImageIcon, MessageSquare, Palette } from 'lucide-react'
import { useRef } from 'react'
import { useState } from 'react'
import { Activity, Script } from './canvas-board'
import { DRAG_THRESHOLD } from './constants'

const PALETTE_COLORS = [
	'#FF6B6B',
	'#FF9F43',
	'#FFEAA7',
	'#55EFC4',
	'#81ECEC',
	'#74B9FF',
	'#A29BFE',
	'#FD79A8',
	'#FDCB6E',
	'#B2BEC3',
	'#2D3436',
	'#FFFFFF',
]

type PaletteTab = 'activities' | 'scripts' | 'colors'

export default function CanvasPalette({
	activities,
	scripts,
	onAdd,
	onDragStart,
	onDragMove,
	onDragEnd,
}: {
	activities: Activity[]
	scripts: Script[]
	onAdd: (type: 'activity' | 'script' | 'color', sourceId?: string, color?: string) => void
	onDragStart: (
		type: 'activity' | 'script' | 'color',
		clientX: number,
		clientY: number,
		sourceId?: string,
		color?: string,
	) => void
	onDragMove: (clientX: number, clientY: number) => void
	onDragEnd: (clientX: number, clientY: number) => void
}) {
	const [isExpanded, setIsExpanded] = useState(true)
	const [activeTab, setActiveTab] = useState<PaletteTab>('activities')

	function switchTab(tab: PaletteTab) {
		setActiveTab(tab)
		setIsExpanded(true)
	}

	return (
		<div data-testid="canvas-palette" className="border-t border-gray-200 bg-white flex-shrink-0 shadow-lg">
			<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
				<div className="flex gap-2">
					<TabButton
						active={activeTab === 'activities'}
						onClick={() => switchTab('activities')}
						icon={<ImageIcon className="w-4 h-4" />}
						label="Activities"
					/>
					<TabButton
						active={activeTab === 'scripts'}
						onClick={() => switchTab('scripts')}
						icon={<MessageSquare className="w-4 h-4" />}
						label="Scripts"
					/>
					<TabButton
						active={activeTab === 'colors'}
						onClick={() => switchTab('colors')}
						icon={<Palette className="w-4 h-4" />}
						label="Colours"
					/>
				</div>
				<button
					data-testid="palette-toggle"
					className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
					onClick={() => setIsExpanded(!isExpanded)}
					aria-label={isExpanded ? 'Collapse palette' : 'Expand palette'}
				>
					{isExpanded ? (
						<ChevronDown className="w-5 h-5" />
					) : (
						<ChevronUp className="w-5 h-5" />
					)}
				</button>
			</div>

			{isExpanded && (
				<div className="p-4 overflow-x-auto" style={{ minHeight: 120 }}>
					{activeTab === 'activities' && (
						<ActivitiesTab
							activities={activities}
							onAdd={onAdd}
							onDragStart={onDragStart}
							onDragMove={onDragMove}
							onDragEnd={onDragEnd}
						/>
					)}
					{activeTab === 'scripts' && (
						<ScriptsTab
							scripts={scripts}
							onAdd={onAdd}
							onDragStart={onDragStart}
							onDragMove={onDragMove}
							onDragEnd={onDragEnd}
						/>
					)}
					{activeTab === 'colors' && (
						<ColorsTab
							onAdd={onAdd}
							onDragStart={onDragStart}
							onDragMove={onDragMove}
							onDragEnd={onDragEnd}
						/>
					)}
				</div>
			)}
		</div>
	)
}

function TabButton({
	active,
	onClick,
	icon,
	label,
}: {
	active: boolean
	onClick: () => void
	icon: any
	label: string
}) {
	return (
		<button
			data-testid="palette-tab-button"
			className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
				active
					? 'bg-brand text-white shadow-md'
					: 'text-gray-700 hover:bg-gray-200 border border-gray-200'
			}`}
			onClick={onClick}
		>
			{icon}
			{label}
		</button>
	)
}

type DragHandlers = {
	onDragStart: (
		type: 'activity' | 'script' | 'color',
		clientX: number,
		clientY: number,
		sourceId?: string,
		color?: string,
	) => void
	onDragMove: (clientX: number, clientY: number) => void
	onDragEnd: (clientX: number, clientY: number) => void
}

function usePaletteItemDrag(
	type: 'activity' | 'script' | 'color',
	onTap: () => void,
	handlers: DragHandlers,
	sourceId?: string,
	color?: string,
) {
	const pointerDownRef = useRef<{ clientX: number; clientY: number } | null>(null)
	const hasDraggedRef = useRef(false)

	return {
		style: { touchAction: 'none' as const },
		onPointerDown(e: any) {
			e.currentTarget.setPointerCapture(e.pointerId)
			pointerDownRef.current = { clientX: e.clientX, clientY: e.clientY }
			hasDraggedRef.current = false
		},
		onPointerMove(e: any) {
			if (!pointerDownRef.current) return
			const dx = e.clientX - pointerDownRef.current.clientX
			const dy = e.clientY - pointerDownRef.current.clientY
			if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
				if (!hasDraggedRef.current) {
					hasDraggedRef.current = true
					handlers.onDragStart(type, e.clientX, e.clientY, sourceId, color)
				} else {
					handlers.onDragMove(e.clientX, e.clientY)
				}
			}
		},
		onPointerUp(e: any) {
			if (!pointerDownRef.current) return
			if (hasDraggedRef.current) {
				handlers.onDragEnd(e.clientX, e.clientY)
			} else {
				onTap()
			}
			pointerDownRef.current = null
			hasDraggedRef.current = false
		},
	}
}

function ActivitiesTab({
	activities,
	onAdd,
	onDragStart,
	onDragMove,
	onDragEnd,
}: {
	activities: Activity[]
	onAdd: (type: 'activity' | 'script' | 'color', sourceId?: string, color?: string) => void
} & DragHandlers) {
	if (activities.length === 0) {
		return (
			<p className="text-gray-400 text-sm text-center py-4">
				No activities yet — create boards first
			</p>
		)
	}

	return (
		<div className="flex gap-3">
			{activities.map(activity => (
				<ActivityPaletteItem
					key={activity.id}
					activity={activity}
					onAdd={onAdd}
					onDragStart={onDragStart}
					onDragMove={onDragMove}
					onDragEnd={onDragEnd}
				/>
			))}
		</div>
	)
}

function ActivityPaletteItem({
	activity,
	onAdd,
	onDragStart,
	onDragMove,
	onDragEnd,
}: {
	activity: Activity
	onAdd: (type: 'activity' | 'script' | 'color', sourceId?: string, color?: string) => void
} & DragHandlers) {
	const dragHandlers = { onDragStart, onDragMove, onDragEnd }
	const imageUrl = useQuery(
		api.boards.getImageUrl,
		activity.imageStorageId ? { storageId: activity.imageStorageId } : 'skip',
	)

	const pointerProps = usePaletteItemDrag(
		'activity',
		() => onAdd('activity', activity.id),
		dragHandlers,
		activity.id,
	)

	return (
		<button
			data-testid="activity-palette-item"
			className="flex-shrink-0 w-24 rounded-lg border-2 border-gray-200 overflow-hidden hover:border-brand hover:shadow-md transition-all active:scale-95 bg-white"
			aria-label={`Add ${activity.title} to canvas`}
			{...pointerProps}
		>
			<div className="w-full aspect-square bg-gray-100">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={activity.title}
						className="w-full h-full object-cover"
						draggable={false}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						{activity.imageStorageId ? (
							<div className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
						) : (
							<ImageIcon className="w-6 h-6 text-gray-400" />
						)}
					</div>
				)}
			</div>
			<p className="text-xs text-center py-1.5 px-1 truncate text-gray-700 font-medium">
				{activity.title}
			</p>
		</button>
	)
}

function ScriptsTab({
	scripts,
	onAdd,
	onDragStart,
	onDragMove,
	onDragEnd,
}: {
	scripts: Script[]
	onAdd: (type: 'activity' | 'script' | 'color', sourceId?: string, color?: string) => void
} & DragHandlers) {
	if (scripts.length === 0) {
		return (
			<p className="text-gray-400 text-sm text-center py-4">
				No scripts yet — add scripts to see them here
			</p>
		)
	}

	return (
		<div className="flex gap-3">
			{scripts.map(script => (
				<ScriptPaletteItem
					key={script._id}
					script={script}
					onAdd={onAdd}
					onDragStart={onDragStart}
					onDragMove={onDragMove}
					onDragEnd={onDragEnd}
				/>
			))}
		</div>
	)
}

function ScriptPaletteItem({
	script,
	onAdd,
	onDragStart,
	onDragMove,
	onDragEnd,
}: {
	script: Script
	onAdd: (type: 'activity' | 'script' | 'color', sourceId?: string, color?: string) => void
} & DragHandlers) {
	const dragHandlers = { onDragStart, onDragMove, onDragEnd }
	const pointerProps = usePaletteItemDrag(
		'script',
		() => onAdd('script', script._id as string),
		dragHandlers,
		script._id as string,
	)

	return (
		<button
			data-testid="script-palette-item"
			className="flex-shrink-0 w-32 h-24 rounded-lg border-2 border-gray-200 bg-brand/5 hover:border-brand hover:shadow-md transition-all active:scale-95 p-3 flex items-center justify-center"
			aria-label="Add script to canvas"
			{...pointerProps}
		>
			<p className="text-xs text-center text-gray-700 line-clamp-4 leading-snug font-medium">
				{script.dialogue}
			</p>
		</button>
	)
}

function ColorsTab({
	onAdd,
	onDragStart,
	onDragMove,
	onDragEnd,
}: {
	onAdd: (type: 'activity' | 'script' | 'color', sourceId?: string, color?: string) => void
} & DragHandlers) {
	return (
		<div className="flex flex-wrap gap-4">
			{PALETTE_COLORS.map(color => (
				<ColorPaletteItem
					key={color}
					color={color}
					onAdd={onAdd}
					onDragStart={onDragStart}
					onDragMove={onDragMove}
					onDragEnd={onDragEnd}
				/>
			))}
		</div>
	)
}

function ColorPaletteItem({
	color,
	onAdd,
	onDragStart,
	onDragMove,
	onDragEnd,
}: {
	color: string
	onAdd: (type: 'activity' | 'script' | 'color', sourceId?: string, color?: string) => void
} & DragHandlers) {
	const dragHandlers = { onDragStart, onDragMove, onDragEnd }
	const pointerProps = usePaletteItemDrag(
		'color',
		() => onAdd('color', undefined, color),
		dragHandlers,
		undefined,
		color,
	)

	return (
		<button
			className="w-14 h-14 rounded-lg border-2 border-gray-300 hover:border-gray-500 hover:shadow-md active:scale-90 transition-all shadow-sm"
			data-testid="color-option"
			aria-label={`Add ${color} colour tile`}
			title={color}
			{...pointerProps}
			style={{ ...pointerProps.style, backgroundColor: color }}
		/>
	)
}
