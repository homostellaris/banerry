import { Loader2 } from 'lucide-react'

export default function MitigationsLoading() {
	return (
		<div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-brand/20 rounded-lg bg-brand/5 min-h-[300px]">
			<Loader2 className="h-16 w-16 text-brand animate-spin mb-6" />
			<p className="text-2xl font-medium text-brand mb-2">
				Generating variations...
			</p>
			<p className="text-lg text-gray-600 mb-4">
				This may take up to 15 seconds
			</p>
			<div className="mt-6 max-w-md text-center">
				<p className="text-gray-500">
					The AI is creating personalized variations of the script to help
					develop language skills
				</p>
			</div>

			{/* Progress indicator */}
			<div className="mt-8 w-64 bg-brand/20 rounded-full h-2">
				<div
					className="bg-brand h-2 rounded-full animate-pulse"
					style={{ width: '60%' }}
				></div>
			</div>
		</div>
	)
}
