"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useVoice } from "@/app/contexts/voice-context";
import { useCachedTTS } from "@/app/hooks/use-cached-tts";
import { Doc } from "@/convex/_generated/dataModel";

export default function ScriptCard({ script }: { script: Doc<"scripts"> }) {
  const { selectedVoice } = useVoice();
  const { speak, isLoading, error } = useCachedTTS();

  const playAudio = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    speak(script.dialogue, selectedVoice);
  };

  return (
    <Card className="overflow-hidden border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800 pr-4">
            {script.dialogue}
          </h3>
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
  );
}
