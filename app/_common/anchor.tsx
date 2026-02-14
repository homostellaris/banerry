import { JSX, PropsWithChildren } from 'react'

export default function Anchor({
	children,
	...props
}: PropsWithChildren & JSX.IntrinsicElements['a']) {
	return (
		<span
			className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
			{...props}
		>
			{children}
		</span>
	)
}
