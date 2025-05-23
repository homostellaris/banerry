"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2 } from "lucide-react"
import { generateSpeech } from "@/app/actions/tts"

const voices = [
  { id: "alloy", name: "Alloy", description: "Neutral, balanced" },
  { id: "echo", name: "Echo", description: "Clear, articulate" },
  { id: "fable", name: "Fable", description: "Warm, expressive" },
  { id: "onyx", name: "Onyx", description: "Deep, authoritative" },
  { id: "nova", name: "Nova", description: "Bright, energetic" },
  { id: "shimmer", name: "Shimmer", description: "Soft, gentle" },
]

interface VoiceSelectorProps {
  onVoiceChange?: (voice: string) => void
  className?: string
}

export default function VoiceSelector({ onVoiceChange, className = "" }: VoiceSelectorProps) {
  const [selectedVoice, setSelectedVoice] = useState("nova")
  const [isTestingVoice, setIsTestingVoice] = useState(false)

  // Load saved voice preference on mount
  useEffect(() => {
    const savedVoice = localStorage.getItem("tts-voice")
    if (savedVoice && voices.find((v) => v.id === savedVoice)) {
      setSelectedVoice(savedVoice)
      onVoiceChange?.(savedVoice)
    }
  }, [onVoiceChange])

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice)
    localStorage.setItem("tts-voice", voice)
    onVoiceChange?.(voice)
  }

  const testVoice = async () => {
    if (isTestingVoice) return

    setIsTestingVoice(true)
    try {
      const result = await generateSpeech("Hello, this is how I sound!", selectedVoice)

      if (result.success) {
        // Convert base64 back to audio data and play
        const audioData = Uint8Array.from(atob(result.audioData), (c) => c.charCodeAt(0))
        const audioBlob = new Blob([audioData], { type: result.contentType })
        const audioUrl = URL.createObjectURL(audioBlob)

        const audio = new Audio(audioUrl)
        audio.onended = () => URL.revokeObjectURL(audioUrl)
        await audio.play()
      }
    } catch (error) {
      console.error("Error testing voice:", error)
    } finally {
      setIsTestingVoice(false)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <label htmlFor="voice-select" className="text-sm font-medium text-gray-700 min-w-[40px]">
          Voice:
        </label>
        <Select value={selectedVoice} onValueChange={handleVoiceChange}>
          <SelectTrigger className="flex-1" id="voice-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {voices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{voice.name}</span>
                  <span className="text-xs text-gray-500">{voice.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center">
        <button
          onClick={testVoice}
          disabled={isTestingVoice}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 hover:bg-purple-200 disabled:opacity-50 transition-colors rounded-md"
          aria-label="Test selected voice"
        >
          <Volume2 className={`h-4 w-4 text-purple-700 ${isTestingVoice ? "animate-pulse" : ""}`} />
          {isTestingVoice ? "Testing..." : "Test Voice"}
        </button>
      </div>
    </div>
  )
}
