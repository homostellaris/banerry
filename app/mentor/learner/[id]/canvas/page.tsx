import CanvasBoard from '@/app/_canvas/canvas-board'
import { Id } from '@/convex/_generated/dataModel'

export default async function CanvasPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return (
		<div className="flex flex-col" style={{ height: 'calc(100dvh - 3.5rem)' }}>
			<CanvasBoard learnerId={id as Id<'learners'>} />
		</div>
	)
}
