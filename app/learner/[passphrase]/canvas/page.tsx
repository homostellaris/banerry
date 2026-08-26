import { CanvasPageContent } from '@/app/_canvas/canvas-page-content'

export default async function CanvasPage({
	params,
}: {
	params: Promise<{ passphrase: string }>
}) {
	const { passphrase } = await params

	return <CanvasPageContent passphrase={passphrase} />
}
