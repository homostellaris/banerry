export async function playCompletionSound(): Promise<void> {
	const AudioContextClass =
		window.AudioContext ||
		(window as unknown as { webkitAudioContext: typeof AudioContext })
			.webkitAudioContext
	const audioContext = new AudioContextClass()

	if (audioContext.state === 'suspended') {
		await audioContext.resume()
	}

	const playNote = (frequency: number, startTime: number, duration: number) => {
		const oscillator = audioContext.createOscillator()
		const gainNode = audioContext.createGain()

		oscillator.connect(gainNode)
		gainNode.connect(audioContext.destination)

		oscillator.frequency.setValueAtTime(frequency, startTime)
		oscillator.type = 'triangle'

		gainNode.gain.setValueAtTime(0, startTime)
		gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01)
		gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

		oscillator.start(startTime)
		oscillator.stop(startTime + duration)
	}

	const now = audioContext.currentTime
	playNote(523, now, 0.3) // C5
	playNote(659, now + 0.15, 0.3) // E5
	playNote(784, now + 0.3, 0.3) // G5
	playNote(1047, now + 0.45, 0.5) // C6

	setTimeout(() => {
		playNote(1319, now + 0.7, 0.2) // E6
		playNote(1568, now + 0.8, 0.2) // G6
	}, 700)
}
