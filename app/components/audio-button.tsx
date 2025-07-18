"use client";

import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { useVoice } from "@/app/contexts/voice-context";
import { useCachedTTS } from "@/app/hooks/use-cached-tts";

interface AudioButtonProps {
  text: string;
}

export default function AudioButton({ text }: AudioButtonProps) {
  const { selectedVoice } = useVoice();
  const { speak, isLoading, error } = useCachedTTS();

  const playAudio = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    speak(text, selectedVoice);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-14 w-14 flex-shrink-0 bg-purple-100 hover:bg-purple-200"
        onClick={playAudio}
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
  );
}
