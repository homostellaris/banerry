"use client";

import { useState, useRef } from "react";
import { audioCache } from "@/app/_tts/audio-cache";
import { streamSpeech } from "@/app/_tts/stream-speech";
import { TextToSpeechRequest } from "@elevenlabs/elevenlabs-js/api";

export function useCachedTTS() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  if (typeof window !== "undefined" && !audioRef.current) {
    audioRef.current = new Audio();
  }

  const speak = async (text: string, voice = "nova") => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      console.log(`Requesting speech for: "${text}" with voice: ${voice}`);

      // Check cache first
      let audioUrl: string = "";
      let fromCache = false;

      try {
        const cachedAudio = await audioCache.get(text, voice);
        if (cachedAudio) {
          console.log("Using cached audio");
          const audioBlob = new Blob([cachedAudio.audioData], {
            type: cachedAudio.contentType,
          });
          audioUrl = URL.createObjectURL(audioBlob);
          fromCache = true;
        }
      } catch (cacheError) {
        console.warn(
          "Cache read failed, proceeding with server request:",
          cacheError
        );
      }

      if (!fromCache) {
        const request: TextToSpeechRequest = {
          text: text,
          modelId: "eleven_flash_v2_5",
          // voiceSettings: {
          //   stability: settings.stability,
          //   similarityBoost: settings.similarityBoost,
          //   style: settings.style,
          //   speed: settings.speed,
          //   useSpeakerBoost: settings.useSpeakerBoost,
          // },
        };
        console.log("Generating new audio");
        const result = await streamSpeech(FEATURED_VOICES[0].id, request);

        if (!result.ok) {
          throw new Error(result.error);
        }

        const stream = result.value;
        const response = new Response(stream);
        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);

        try {
          const arrayBuffer = await blob.arrayBuffer();
          await audioCache.set(text, voice, arrayBuffer, blob.type);
        } catch (cacheError) {
          console.warn(
            "Failed to cache audio, but continuing with playback:",
            cacheError
          );
        }
      }

      console.log("Audio data ready, preparing to play");

      if (audioRef.current) {
        audioRef.current.src = audioUrl;

        audioRef.current.onerror = (e) => {
          console.error("Audio playback error:", e);
          URL.revokeObjectURL(audioUrl);
          setError("Failed to play audio");
        };

        await audioRef.current.play();
        console.log("Audio playback started");

        // Clean up the URL when audio is done playing
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          console.log("Audio playback completed");
        };
      }
    } catch (err) {
      console.error("Error playing TTS:", err);

      let errorMessage = "Failed to play audio";

      if (err instanceof Error) {
        if (err.message.includes("API key")) {
          errorMessage = "Text-to-speech is unavailable (API key issue)";
        } else if (err.message.includes("Rate limit")) {
          errorMessage = "Too many requests. Please try again later.";
        } else if (err.message.includes("transaction")) {
          errorMessage = "Cache error, but audio should still work";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { speak, isLoading, error };
}

const FEATURED_VOICES = [
  { id: "vBKc2FfBKJfcZNyEt1n6", name: "Finn", accent: "American" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", accent: "American" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", accent: "American" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Adam", accent: "American" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Nicole", accent: "American" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", accent: "American" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", accent: "American" },
  { id: "jBpfuIE2acCO8z3wKNLl", name: "Callum", accent: "British" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Charlotte", accent: "British" },
];
