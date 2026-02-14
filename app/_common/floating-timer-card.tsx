'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Clock, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTimer } from './timer-context'
import { useIsTimerPage } from './use-timer-page'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type DockPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface Position {
	x: number
	y: number
}

export function FloatingTimerCard() {
	const { state, timeLeft, formatTime, getTimerColor, stopTimer } = useTimer()
	const isOnTimerPage = useIsTimerPage()
	const router = useRouter()

	const [position, setPosition] = useState<Position>({ x: 20, y: 20 })
	const [isDragging, setIsDragging] = useState(false)
	const [hasDragged, setHasDragged] = useState(false)
	const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
	const [dockedPosition, setDockedPosition] =
		useState<DockPosition>('top-right')
	const cardRef = useRef<HTMLDivElement>(null)

	// Don't show the floating card if we're on the timer page or timer is idle
	const shouldShow =
		!isOnTimerPage &&
		(state === 'running' || state === 'paused' || state === 'completed')

	// Calculate dock positions based on viewport
	const getDockPosition = useCallback((dockPos: DockPosition): Position => {
		const viewportWidth = window.innerWidth
		const viewportHeight = window.innerHeight
		const cardWidth = 200 // Approximate card width
		const cardHeight = 80 // Approximate card height

		switch (dockPos) {
			case 'top-left':
				return { x: 20, y: 60 }
			case 'top-right':
				return { x: viewportWidth - cardWidth, y: 60 }
			case 'bottom-left':
				return { x: 20, y: viewportHeight - cardHeight - 8 }
			case 'bottom-right':
				return {
					x: viewportWidth - cardWidth,
					y: viewportHeight - cardHeight - 80,
				}
		}
	}, [])

	// Find nearest dock position
	const findNearestDock = useCallback((pos: Position): DockPosition => {
		const viewportWidth = window.innerWidth
		const viewportHeight = window.innerHeight
		const centerX = viewportWidth / 2
		const centerY = viewportHeight / 2

		if (pos.x < centerX && pos.y < centerY) return 'top-left'
		if (pos.x >= centerX && pos.y < centerY) return 'top-right'
		if (pos.x < centerX && pos.y >= centerY) return 'bottom-left'
		return 'bottom-right'
	}, [])

	// Initialize position based on docked position
	useEffect(() => {
		const savedDockPosition = localStorage.getItem(
			'floating-timer-dock',
		) as DockPosition
		if (savedDockPosition) {
			setDockedPosition(savedDockPosition)
		}
		setPosition(getDockPosition(savedDockPosition || 'top-right'))
	}, [getDockPosition])

	// Update position when window resizes
	useEffect(() => {
		const handleResize = () => {
			if (!isDragging) {
				setPosition(getDockPosition(dockedPosition))
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [dockedPosition, isDragging, getDockPosition])

	// Mouse/touch event handlers
	const handleStart = useCallback((clientX: number, clientY: number) => {
		if (!cardRef.current) return

		setIsDragging(true)
		setHasDragged(false)
		const rect = cardRef.current.getBoundingClientRect()
		setDragOffset({
			x: clientX - rect.left,
			y: clientY - rect.top,
		})
	}, [])

	const handleMove = useCallback(
		(clientX: number, clientY: number) => {
			if (!isDragging) return

			const newX = clientX - dragOffset.x
			const newY = clientY - dragOffset.y

			// Check if we actually moved significantly
			const distanceMoved =
				Math.abs(newX - position.x) + Math.abs(newY - position.y)
			if (distanceMoved > 5) {
				setHasDragged(true)
			}

			// Constrain to viewport
			const constrainedX = Math.max(0, Math.min(window.innerWidth - 200, newX))
			const constrainedY = Math.max(0, Math.min(window.innerHeight - 80, newY))

			setPosition({ x: constrainedX, y: constrainedY })
		},
		[isDragging, dragOffset, position],
	)

	const handleEnd = useCallback(() => {
		if (!isDragging) return

		setIsDragging(false)

		// Snap to nearest dock position
		const nearestDock = findNearestDock(position)
		const dockPos = getDockPosition(nearestDock)

		setPosition(dockPos)
		setDockedPosition(nearestDock)
		localStorage.setItem('floating-timer-dock', nearestDock)
	}, [isDragging, position, findNearestDock, getDockPosition])

	// Mouse events
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
		handleStart(e.clientX, e.clientY)
	}

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			handleMove(e.clientX, e.clientY)
		},
		[handleMove],
	)

	const handleMouseUp = useCallback(() => {
		handleEnd()
	}, [handleEnd])

	// Touch events
	const handleTouchStart = (e: React.TouchEvent) => {
		const touch = e.touches[0]
		handleStart(touch.clientX, touch.clientY)
	}

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (hasDragged) {
				e.preventDefault()
			}
			const touch = e.touches[0]
			handleMove(touch.clientX, touch.clientY)
		},
		[handleMove, hasDragged],
	)

	const handleTouchEnd = useCallback(
		(e: TouchEvent) => {
			if (hasDragged) {
				e.preventDefault()
			}
			handleEnd()
		},
		[handleEnd, hasDragged],
	)

	// Add global event listeners for drag
	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
			document.addEventListener('touchmove', handleTouchMove, {
				passive: false,
			})
			document.addEventListener('touchend', handleTouchEnd, { passive: false })

			return () => {
				document.removeEventListener('mousemove', handleMouseMove)
				document.removeEventListener('mouseup', handleMouseUp)
				document.removeEventListener('touchmove', handleTouchMove)
				document.removeEventListener('touchend', handleTouchEnd)
			}
		}
	}, [
		isDragging,
		handleMouseMove,
		handleMouseUp,
		handleTouchMove,
		handleTouchEnd,
	])

	const handleCardClick = () => {
		// Only navigate if we didn't just finish dragging
		if (!hasDragged) {
			// Navigate to timer page based on current path
			const currentPath = window.location.pathname
			if (currentPath.includes('/learner/')) {
				// Extract passphrase for learner routes
				const parts = currentPath.split('/')
				const passphraseIndex = parts.indexOf('learner') + 1
				if (passphraseIndex < parts.length) {
					const passphrase = parts[passphraseIndex]
					router.push(`/learner/${passphrase}/timer`)
				}
			} else {
				// Default to mentor timer
				router.push('/mentor/timer')
			}
		}
		// Reset the dragged flag after a short delay
		setTimeout(() => setHasDragged(false), 100)
	}

	const handleStopClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		stopTimer()
	}

	if (!shouldShow) return null

	return (
		<Card
			ref={cardRef}
			className={cn(
				'fixed z-50 shadow-lg cursor-pointer select-none transition-transform hover:scale-105',
				isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab',
				state === 'completed' && 'bg-green-50 border-green-200',
			)}
			style={{
				left: position.x,
				top: position.y,
				transform: isDragging ? 'rotate(2deg)' : 'none',
			}}
			onMouseDown={handleMouseDown}
			onTouchStart={handleTouchStart}
			onClick={handleCardClick}
		>
			<CardContent className="p-3">
				<div className="flex items-center justify-between gap-6">
					<Clock className="h-4 w-4 text-purple-700" />
					<div className={cn('text-lg font-mono font-bold', getTimerColor())}>
						{formatTime(timeLeft)}
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0 hover:bg-red-100"
						onClick={handleStopClick}
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
