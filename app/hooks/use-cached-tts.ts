"use client"

import { useState, useRef } from "react"
import { generateSpeech } from "@/app/actions/tts"
import { audioCache } from "@/app/utils/audio-cache"

export function useCachedTTS() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element
  if (typeof window !== "undefined" && !audioRef.current) {
    audioRef.current = new Audio()
  }

  const speak = async (text: string, voice = "nova") => {
    try {
      setIsLoading(true)
      setError(null)

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      console.log(`Requesting speech for: "${text}" with voice: ${voice}`)

      // Check cache first
      let audioData: string
      let contentType: string
      let fromCache = false

      try {
        const cachedAudio = await audioCache.get(text, voice)
        if (cachedAudio) {
          console.log("Using cached audio")
          audioData = cachedAudio.audioData
          contentType = cachedAudio.contentType
          fromCache = true
        }
      } catch (cacheError) {
        console.warn("Cache read failed, proceeding with server request:", cacheError)
      }

      if (!fromCache) {
        console.log("Generating new audio")
        // Call the server action
        const result = await generateSpeech(text, voice)

        if (!result.success) {
          throw new Error(result.error || "Failed to generate speech")
        }

        audioData = result.audioData
        contentType = result.contentType

        // Try to cache the result, but don't fail if caching fails
        try {
          await audioCache.set(text, voice, audioData, contentType)
        } catch (cacheError) {
          console.warn("Failed to cache audio, but continuing with playback:", cacheError)
        }
      }

      // Convert base64 back to audio data
      const audioDataArray = Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))
      const audioBlob = new Blob([audioDataArray], { type: contentType })

      console.log("Audio data ready, preparing to play")

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
        } else if (err.message.includes("transaction")) {
          errorMessage = "Cache error, but audio should still work"
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return { speak, isLoading, error }
}
