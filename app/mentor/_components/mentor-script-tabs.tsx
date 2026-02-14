'use client'

import ScriptCard from '@/app/_scripts/script-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Doc } from '@/convex/_generated/dataModel'

export default function MentorScriptTabs({
	scripts,
}: {
	scripts: Doc<'scripts'>[]
}) {
	// Filter recent scripts (created in the last 7 days)
	const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
	const recentScripts = scripts.filter(
		script => script._creationTime > oneWeekAgo,
	)

	return (
		<Tabs
			defaultValue="all"
			className="w-full"
		>
			<TabsList className="grid w-full grid-cols-2 h-17 mb-6">
				<TabsTrigger
					value="all"
					className="text-xl py-4"
				>
					All Scripts
				</TabsTrigger>
				<TabsTrigger
					value="recent"
					className="text-xl py-4"
				>
					Recent Scripts
				</TabsTrigger>
			</TabsList>

			<TabsContent value="all">
				<div className="grid gap-6">
					{scripts.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-gray-500 mb-4">No scripts yet</div>
							<p className="text-sm text-gray-400">
								Add your first script to get started
							</p>
						</div>
					) : (
						scripts.map(script => (
							<ScriptCard
								key={script._id}
								script={script}
							/>
						))
					)}
				</div>
			</TabsContent>

			<TabsContent value="recent">
				<div className="grid gap-6">
					{recentScripts.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-gray-500 mb-4">No recent scripts</div>
							<p className="text-sm text-gray-400">
								Scripts created in the last 7 days will appear here
							</p>
						</div>
					) : (
						recentScripts.map(script => (
							<ScriptCard
								key={script._id}
								script={script}
							/>
						))
					)}
				</div>
			</TabsContent>
		</Tabs>
	)
}
