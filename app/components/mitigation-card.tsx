"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, Loader2 } from "lucide-react"
import { generateSpeech } from "@/app/actions/tts"
import { useState, useRef } from "react"
import { useVoice } from "@/app/contexts/voice-context"

interface MitigationCardProps {
  mitigation: {
    id: string
    text: string
    explanation: string
  }
  originalScript: string
}

export default function MitigationCard({ mitigation, originalScript }: MitigationCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { selectedVoice } = useVoice()

  // Initialize audio element
  if (typeof window !== "undefined" && !audioRef.current) {
    audioRef.current = new Audio()
  }

  const playAudio = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      console.log(`Requesting speech for: "${mitigation.text}" with voice: ${selectedVoice}`)

      // Call the server action directly with selected voice
      const result = await generateSpeech(mitigation.text, selectedVoice)

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

  // Function to highlight matching words
  const highlightMatchingWords = (mitigationText: string, originalText: string) => {
    // Convert both texts to lowercase and split into words
    const originalWords = originalText.toLowerCase().split(/\s+/).filter(Boolean)

    // Create a Set for faster lookups
    const originalWordsSet = new Set(originalWords)

    // Split the mitigation text into words while preserving punctuation
    // This regex captures words and punctuation separately
    const mitigationParts = mitigationText.split(/(\s+|[.,!?;:'"()-])/g).filter(Boolean)

    return (
      <>
        {mitigationParts.map((part, index) => {
          // Check if this part is a word (not whitespace or punctuation)
          const isWord = !/^\s+$/.test(part) && !/^[.,!?;:'"()-]$/.test(part)

          if (isWord && originalWordsSet.has(part.toLowerCase())) {
            // If it's a word that appears in the original script, highlight it
            return (
              <span key={index} className="text-purple-700 font-medium">
                {part}
              </span>
            )
          } else {
            // Otherwise, render it normally
            return <span key={index}>{part}</span>
          }
        })}
      </>
    )
  }

  return (
    <Card className="overflow-hidden border-2 border-green-200 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800 pr-4">
            {highlightMatchingWords(mitigation.text, originalScript)}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 flex-shrink-0 bg-green-100 hover:bg-green-200"
            onClick={playAudio}
            disabled={isLoading}
            aria-label="Play mitigation audio"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 text-green-700 animate-spin" />
            ) : (
              <Volume2 className="h-6 w-6 text-green-700" />
            )}
          </Button>
        </div>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        <p className="mt-4 text-gray-600">{mitigation.explanation}</p>
      </CardContent>
    </Card>
  )
}
