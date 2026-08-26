'use client'

import React, { useState, useRef } from 'react'
import { PaintLayerProps, PaintStroke, PaintMode } from './types'

export function PaintLayer({
	mode = 'draw',
	currentColor = '#3b82f6',
	brushSize = 4,
	strokes = [],
	onStrokeComplete,
	onClearStrokes,
}: PaintLayerProps) {
	const [activeColor, setActiveColor] = useState(currentColor)
	const [activeSize, setActiveSize] = useState(brushSize)
	const [activeMode, setActiveMode] = useState<PaintMode>(mode)
	const [isDrawing, setIsDrawing] = useState(false)
	const [currentPoints, setCurrentPoints] = useState<Array<{ x: number; y: number }>>([])
	const containerRef = useRef<HTMLDivElement>(null)

	const colorOptions = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#000000']
	const sizeOptions = [2, 4, 8, 12]

	const getPoint = (
		clientX: number,
		clientY: number
	): { x: number; y: number } => {
		if (!containerRef.current) return { x: 10, y: 10 }
		const rect = containerRef.current.getBoundingClientRect()
		const x = Math.round(clientX - rect.left)
		const y = Math.round(clientY - rect.top)
		return {
			x: x > 0 ? x : 20,
			y: y > 0 ? y : 20,
		}
	}

	const handleStart = (clientX: number, clientY: number) => {
		if (activeMode === 'erase') {
			onClearStrokes?.()
			return
		}
		setIsDrawing(true)
		const pt = getPoint(clientX, clientY)
		setCurrentPoints([pt])
	}

	const handleMove = (clientX: number, clientY: number) => {
		if (!isDrawing) return
		const pt = getPoint(clientX, clientY)
		setCurrentPoints(prev => [...prev, pt])
	}

	const handleEnd = () => {
		if (!isDrawing) return
		setIsDrawing(false)
		if (currentPoints.length > 0) {
			const newStroke: PaintStroke = {
				id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
				points: currentPoints,
				color: activeColor,
				size: activeSize,
			}
			onStrokeComplete?.(newStroke)
		}
		setCurrentPoints([])
	}

	return (
		<div
			ref={containerRef}
			data-name="paint-layer"
			data-mode={activeMode}
			data-color={activeColor}
			data-brush-size={activeSize}
			className="absolute inset-0 z-10 flex flex-col pointer-events-auto touch-none select-none"
			onMouseDown={e => {
				if (e.button === 0 || e.button === undefined || (e.nativeEvent as any)?.which === 1) {
					handleStart(e.clientX, e.clientY)
				}
			}}
			onMouseMove={e => handleMove(e.clientX, e.clientY)}
			onMouseUp={handleEnd}
			onMouseLeave={handleEnd}
			onTouchStart={e => {
				if (e.touches.length > 0) {
					handleStart(e.touches[0].clientX, e.touches[0].clientY)
				}
			}}
			onTouchMove={e => {
				if (e.touches.length > 0) {
					handleMove(e.touches[0].clientX, e.touches[0].clientY)
				}
			}}
			onTouchEnd={handleEnd}
			onTouchCancel={handleEnd}
		>
			{/* Paint Controls Overlay Bar */}
			<div
				className="absolute top-2 left-2 z-20 flex flex-wrap items-center gap-2 p-2 bg-white/90 backdrop-blur border border-gray-200 rounded-lg shadow-sm"
				onClick={e => e.stopPropagation()}
				onMouseDown={e => e.stopPropagation()}
				onTouchStart={e => e.stopPropagation()}
			>
				{/* Color Palette */}
				<div className="flex items-center space-x-1">
					{colorOptions.map(color => (
						<button
							key={color}
							type="button"
							onClick={() => {
								setActiveColor(color)
								setActiveMode('draw')
							}}
							className={`w-5 h-5 rounded-full border border-gray-300 transition-transform ${
								activeColor === color && activeMode === 'draw'
									? 'scale-125 ring-2 ring-blue-400'
									: 'hover:scale-110'
							}`}
							style={{ backgroundColor: color }}
						/>
					))}
				</div>

				<div className="h-4 w-px bg-gray-200 mx-1" />

				{/* Brush Size Controls */}
				<div className="flex items-center space-x-1">
					{sizeOptions.map(sz => (
						<button
							key={sz}
							type="button"
							onClick={() => setActiveSize(sz)}
							className={`px-2 py-0.5 text-xs font-semibold rounded ${
								activeSize === sz ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
							}`}
						>
							{sz}px
						</button>
					))}
				</div>

				<div className="h-4 w-px bg-gray-200 mx-1" />

				{/* Mode Controls & Clear */}
				<button
					type="button"
					onClick={() => {
						onClearStrokes?.()
						setCurrentPoints([])
					}}
					className="px-2 py-0.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded"
				>
					Clear
				</button>
			</div>

			{/* SVG Canvas Layer */}
			<svg className="w-full h-full pointer-events-none">
				{strokes.map(stroke => (
					<polyline
						key={stroke.id}
						data-name="paint-polyline"
						fill="none"
						stroke={stroke.color}
						strokeWidth={stroke.size}
						strokeLinecap="round"
						strokeLinejoin="round"
						points={stroke.points.map(p => `${p.x},${p.y}`).join(' ')}
					/>
				))}
				{currentPoints.length > 0 && (
					<polyline
						data-name="paint-polyline"
						fill="none"
						stroke={activeColor}
						strokeWidth={activeSize}
						strokeLinecap="round"
						strokeLinejoin="round"
						points={currentPoints.map(p => `${p.x},${p.y}`).join(' ')}
					/>
				)}
			</svg>
		</div>
	)
}

