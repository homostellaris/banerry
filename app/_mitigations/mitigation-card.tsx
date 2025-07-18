"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { useVoice } from "@/app/_tts/voice-context";
import { useCachedTTS } from "@/app/_tts/use-cached-tts";

interface MitigationCardProps {
  mitigation: {
    id: string;
    text: string;
    explanation: string;
  };
  originalScript: string;
}

export default function MitigationCard({
  mitigation,
  originalScript,
}: MitigationCardProps) {
  const { selectedVoice } = useVoice();
  const { speak, isLoading, error } = useCachedTTS();

  const playAudio = () => {
    speak(mitigation.text, selectedVoice);
  };

  // Function to highlight matching words
  const highlightMatchingWords = (
    mitigationText: string,
    originalText: string
  ) => {
    // Convert both texts to lowercase and split into words
    const originalWords = originalText
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    // Create a Set for faster lookups
    const originalWordsSet = new Set(originalWords);

    // Split the mitigation text into words while preserving punctuation
    // This regex captures words and punctuation separately
    const mitigationParts = mitigationText
      .split(/(\s+|[.,!?;:'"()-])/g)
      .filter(Boolean);

    return (
      <>
        {mitigationParts.map((part, index) => {
          // Check if this part is a word (not whitespace or punctuation)
          const isWord = !/^\s+$/.test(part) && !/^[.,!?;:'"()-]$/.test(part);

          if (isWord && originalWordsSet.has(part.toLowerCase())) {
            // If it's a word that appears in the original script, highlight it
            return (
              <span key={index} className="text-purple-700 font-medium">
                {part}
              </span>
            );
          } else {
            // Otherwise, render it normally
            return <span key={index}>{part}</span>;
          }
        })}
      </>
    );
  };

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
      </CardContent>
    </Card>
  );
}
