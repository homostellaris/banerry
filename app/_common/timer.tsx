'use client'

import {
	Clock,
	Play,
	Pause,
	Square,
	RotateCcw,
	Volume2,
	VolumeX,
	Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useTimer } from './timer-context'

export default function Timer() {
	const {
		minutes,
		seconds,
		setMinutes,
		setSeconds,
		timeLeft,
		totalTime,
		state,
		progress,
		audioState,
		notificationPermission,
		startTimer,
		pauseTimer,
		stopTimer,
		resetTimer,
		setPresetTimer,
		testAudio,
		formatTime,
		getTimerColor,
		getAudioStatus,
	} = useTimer()

	return (
		<div className="container mx-auto p-4 max-w-4xl">
			<div className="grid gap-6 md:grid-cols-2">
				{/* Timer Display */}
				<Card className="md:col-span-2">
					<CardContent className="pt-6">
						<div className="text-center space-y-6">
							<div
								className={`text-8xl font-bold font-mono ${getTimerColor()}`}
							>
								{state === 'idle'
									? formatTime(minutes * 60 + seconds)
									: formatTime(timeLeft)}
							</div>

							{state !== 'idle' && (
								<div className="space-y-2">
									<Progress
										value={progress}
										className="h-4"
									/>
									<div className="text-sm text-gray-500">
										{totalTime > 0 && `${Math.round(progress)}% complete`}
									</div>
								</div>
							)}

							{state === 'completed' && (
								<div className="bg-green-100 border border-green-300 rounded-lg p-4">
									<div className="flex items-center justify-center space-x-2 text-green-800 mb-2">
										<Volume2 className="h-5 w-5" />
										<span className="text-lg font-semibold">
											Time&apos;s Up! 🎉
										</span>
									</div>
									<div className="text-sm text-green-700 text-center">
										{audioState === 'enabled' && 'Audio notification played'}
										{audioState === 'blocked' &&
											'Audio blocked - notification shown instead'}
										{notificationPermission === 'granted' &&
											audioState !== 'enabled' &&
											' • Browser notification sent'}
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Timer Controls */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Clock className="h-5 w-5" />
							<span>Set Timer</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="seconds">Seconds</Label>
								<Input
									id="seconds"
									type="number"
									min="0"
									max="300"
									value={seconds}
									onChange={e =>
										setSeconds(
											Math.max(0, Math.min(300, parseInt(e.target.value) || 0)),
										)
									}
									disabled={state !== 'idle'}
									className="text-lg text-center"
								/>
							</div>
							<div>
								<Label htmlFor="minutes">Minutes (optional)</Label>
								<Input
									id="minutes"
									type="number"
									min="0"
									max="10"
									value={minutes}
									onChange={e =>
										setMinutes(Math.max(0, parseInt(e.target.value) || 0))
									}
									disabled={state !== 'idle'}
									className="text-lg text-center"
								/>
							</div>
						</div>

						{/* Audio Status */}
						<div className="flex items-center justify-center space-x-2 text-sm mb-4">
							{(() => {
								const status = getAudioStatus()
								const IconComponent =
									status.icon === 'VolumeX'
										? VolumeX
										: status.icon === 'Bell'
											? Bell
											: Volume2
								return (
									<>
										<IconComponent className={`h-4 w-4 ${status.color}`} />
										<span className={status.color}>{status.message}</span>
										{audioState !== 'enabled' && (
											<Button
												onClick={testAudio}
												variant="outline"
												size="sm"
												className="ml-2"
											>
												Test Audio
											</Button>
										)}
									</>
								)
							})()}
						</div>

						<div className="flex flex-wrap gap-2 justify-center">
							{state === 'idle' && (
								<Button
									onClick={() => startTimer()}
									disabled={minutes === 0 && seconds === 0}
									className="bg-green-600 hover:bg-green-700 text-white"
									size="lg"
								>
									<Play className="h-4 w-4 mr-2" />
									Start
								</Button>
							)}

							{state === 'running' && (
								<Button
									onClick={pauseTimer}
									className="bg-yellow-600 hover:bg-yellow-700 text-white"
									size="lg"
								>
									<Pause className="h-4 w-4 mr-2" />
									Pause
								</Button>
							)}

							{state === 'paused' && (
								<Button
									onClick={() => startTimer()}
									className="bg-green-600 hover:bg-green-700 text-white"
									size="lg"
								>
									<Play className="h-4 w-4 mr-2" />
									Resume
								</Button>
							)}

							{(state === 'running' || state === 'paused') && (
								<Button
									onClick={stopTimer}
									variant="destructive"
									size="lg"
								>
									<Square className="h-4 w-4 mr-2" />
									Stop
								</Button>
							)}

							<Button
								onClick={resetTimer}
								variant="outline"
								size="lg"
							>
								<RotateCcw className="h-4 w-4 mr-2" />
								Reset
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Preset Timers */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Timers</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-2">
							<Button
								onClick={() => setPresetTimer(0, 5)}
								disabled={state !== 'idle'}
								variant="outline"
								className="h-12 text-lg"
							>
								5 sec
							</Button>
							<Button
								onClick={() => setPresetTimer(0, 10)}
								disabled={state !== 'idle'}
								variant="outline"
								className="h-12 text-lg"
							>
								10 sec
							</Button>
							<Button
								onClick={() => setPresetTimer(0, 20)}
								disabled={state !== 'idle'}
								variant="outline"
								className="h-12 text-lg"
							>
								20 sec
							</Button>
							<Button
								onClick={() => setPresetTimer(0, 30)}
								disabled={state !== 'idle'}
								variant="outline"
								className="h-12 text-lg"
							>
								30 sec
							</Button>
							<Button
								onClick={() => setPresetTimer(1, 0)}
								disabled={state !== 'idle'}
								variant="outline"
								className="h-12 text-lg"
							>
								1 min
							</Button>
							<Button
								onClick={() => setPresetTimer(2, 0)}
								disabled={state !== 'idle'}
								variant="outline"
								className="h-12 text-lg"
							>
								2 min
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
