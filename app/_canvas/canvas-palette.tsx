'use client'

import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { ChevronDown, ChevronUp, ImageIcon, MessageSquare, Palette } from 'lucide-react'
import { useState } from 'react'
import { Activity, Script } from './canvas-board'

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
}: {
	activities: Activity[]
	scripts: Script[]
	onAdd: (
		type: 'activity' | 'script' | 'color',
		sourceId?: string,
		color?: string,
	) => void
}) {
	const [isExpanded, setIsExpanded] = useState(true)
	const [activeTab, setActiveTab] = useState<PaletteTab>('activities')

	function switchTab(tab: PaletteTab) {
		setActiveTab(tab)
		setIsExpanded(true)
	}

	return (
		<div className="border-t border-gray-200 bg-white flex-shrink-0">
			<div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
				<div className="flex gap-1">
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
				<div className="p-3 overflow-x-auto" style={{ minHeight: 108 }}>
					{activeTab === 'activities' && (
						<ActivitiesTab activities={activities} onAdd={onAdd} />
					)}
					{activeTab === 'scripts' && (
						<ScriptsTab scripts={scripts} onAdd={onAdd} />
					)}
					{activeTab === 'colors' && <ColorsTab onAdd={onAdd} />}
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
	icon: React.ReactNode
	label: string
}) {
	return (
		<button
			className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
				active ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
			}`}
			onClick={onClick}
		>
			{icon}
			{label}
		</button>
	)
}

function ActivitiesTab({
	activities,
	onAdd,
}: {
	activities: Activity[]
	onAdd: (
		type: 'activity' | 'script' | 'color',
		sourceId?: string,
		color?: string,
	) => void
}) {
	if (activities.length === 0) {
		return (
			<p className="text-gray-400 text-sm text-center py-4">
				No activities yet — create boards with images first
			</p>
		)
	}

	return (
		<div className="flex gap-3">
			{activities.map(activity => (
				<ActivityPaletteItem key={activity.id} activity={activity} onAdd={onAdd} />
			))}
		</div>
	)
}

function ActivityPaletteItem({
	activity,
	onAdd,
}: {
	activity: Activity
	onAdd: (
		type: 'activity' | 'script' | 'color',
		sourceId?: string,
		color?: string,
	) => void
}) {
	const imageUrl = useQuery(api.boards.getImageUrl, {
		storageId: activity.imageStorageId,
	})

	return (
		<button
			className="flex-shrink-0 w-20 rounded-lg border-2 border-gray-200 overflow-hidden hover:border-brand transition-colors active:scale-95"
			onClick={() => onAdd('activity', activity.id)}
			aria-label={`Add ${activity.title} to canvas`}
		>
			<div className="w-full aspect-square">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={activity.title}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full bg-gray-100 flex items-center justify-center">
						<div className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
					</div>
				)}
			</div>
			<p className="text-xs text-center py-1 px-1 truncate text-gray-700">
				{activity.title}
			</p>
		</button>
	)
}

function ScriptsTab({
	scripts,
	onAdd,
}: {
	scripts: Script[]
	onAdd: (
		type: 'activity' | 'script' | 'color',
		sourceId?: string,
		color?: string,
	) => void
}) {
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
				<button
					key={script._id}
					className="flex-shrink-0 w-28 h-20 rounded-lg border-2 border-gray-200 bg-brand/5 hover:border-brand transition-colors active:scale-95 p-2 flex items-center justify-center"
					onClick={() => onAdd('script', script._id as string)}
					aria-label="Add script to canvas"
				>
					<p className="text-xs text-center text-gray-700 line-clamp-3 leading-tight">
						{script.dialogue}
					</p>
				</button>
			))}
		</div>
	)
}

function ColorsTab({
	onAdd,
}: {
	onAdd: (
		type: 'activity' | 'script' | 'color',
		sourceId?: string,
		color?: string,
	) => void
}) {
	return (
		<div className="flex flex-wrap gap-3">
			{PALETTE_COLORS.map(color => (
				<button
					key={color}
					className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:border-gray-400 active:scale-90 transition-all shadow-sm"
					style={{ backgroundColor: color }}
					onClick={() => onAdd('color', undefined, color)}
					aria-label={`Add ${color} colour tile`}
				/>
			))}
		</div>
	)
}
