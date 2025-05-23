"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, Loader2 } from "lucide-react"
import Link from "next/link"
import { generateSpeech } from "@/app/actions/tts"
import { useState, useRef } from "react"
import { useVoice } from "@/app/contexts/voice-context"

interface ScriptCardProps {
  script: {
    id: string
    text: string
  }
}

export default function ScriptCard({ script }: ScriptCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { selectedVoice } = useVoice()

  // Initialize audio element
  if (typeof window !== "undefined" && !audioRef.current) {
    audioRef.current = new Audio()
  }

  const playAudio = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the button

    try {
      setIsLoading(true)
      setError(null)

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      console.log(`Requesting speech for: "${script.text}" with voice: ${selectedVoice}`)

      // Call the server action directly with selected voice
      const result = await generateSpeech(script.text, selectedVoice)

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
    <Link href={`/script/${script.id}`} className="block">
      <Card className="overflow-hidden border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800 pr-4">{script.text}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-12 w-12 flex-shrink-0 bg-purple-100 hover:bg-purple-200"
              onClick={playAudio}
              disabled={isLoading}
              aria-label="Play script audio"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 text-purple-700 animate-spin" />
              ) : (
                <Volume2 className="h-6 w-6 text-purple-700" />
              )}
            </Button>
          </div>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </CardContent>
      </Card>
    </Link>
  )
}
