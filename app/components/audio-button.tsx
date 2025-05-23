"use client"

import { Button } from "@/components/ui/button"
import { Volume2, Loader2 } from "lucide-react"
import { generateSpeech } from "@/app/actions/tts"
import { useState, useRef } from "react"
import { useVoice } from "@/app/contexts/voice-context"

interface AudioButtonProps {
  text: string
}

export default function AudioButton({ text }: AudioButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { selectedVoice } = useVoice()

  // Initialize audio element
  if (typeof window !== "undefined" && !audioRef.current) {
    audioRef.current = new Audio()
  }

  const handleClick = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      console.log(`Requesting speech for: "${text}" with voice: ${selectedVoice}`)

      // Call the server action directly with selected voice
      const result = await generateSpeech(text, selectedVoice)

      if (!result.success) {
        throw new Error(result.error || "Failed to generate speech")
      }

      // Convert base64 back to audio data
      const audioData = Uint8Array.from(atob(result.audioData), (c) => c.charCodeAt(0))
      const audioBlob = new Blob([audioData], { type: result.contentType })

      console.log("Audio data received, preparing to play")

      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob)

      // Set the audio source and play
      if (audioRef.current) {
        audioRef.current.src = audioUrl

        // Set up error handling for audio playback
        audioRef.current.onerror = (e) => {
          console.error("Audio playback error:", e)
          URL.revokeObjectURL(audioUrl)
          setError("Failed to play audio")
        }

        await audioRef.current.play()
        console.log("Audio playback started")

        // Clean up the URL when audio is done playing
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl)
          console.log("Audio playback completed")
        }
      }
    } catch (err) {
      console.error("Error playing TTS:", err)

      // Provide a user-friendly error message
      let errorMessage = "Failed to play audio"

      if (err instanceof Error) {
        if (err.message.includes("API key")) {
          errorMessage = "Text-to-speech is unavailable (API key issue)"
        } else if (err.message.includes("Rate limit")) {
          errorMessage = "Too many requests. Please try again later."
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-14 w-14 flex-shrink-0 bg-purple-100 hover:bg-purple-200"
        onClick={handleClick}
        disabled={isLoading}
        aria-label="Play audio"
      >
        {isLoading ? (
          <Loader2 className="h-8 w-8 text-purple-700 animate-spin" />
        ) : (
          <Volume2 className="h-8 w-8 text-purple-700" />
        )}
      </Button>
      {error && (
        <div className="absolute mt-2 right-0 bg-red-50 border border-red-200 p-2 rounded text-sm text-red-600 max-w-xs">
          {error}
        </div>
      )}
    </div>
  )
}
