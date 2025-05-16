"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface MitigationProps {
  mitigation: {
    id: string;
    text: string;
    explanation: string;
  };
}

export default function MitigationCard({ mitigation }: MitigationProps) {
  const playAudio = () => {
    // In a real app, this would play the recorded audio
    // For now, we'll use the browser's speech synthesis
    const utterance = new SpeechSynthesisUtterance(mitigation.text);
    speechSynthesis.speak(utterance);
  };

  return (
    <Card className="overflow-hidden border-2 border-green-200 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800 pr-4">
            {mitigation.text}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12 flex-shrink-0 bg-green-100 hover:bg-green-200"
            onClick={playAudio}
            aria-label="Play mitigation audio"
          >
            <Volume2 className="h-6 w-6 text-green-700" />
          </Button>
        </div>
        {/* <p className="mt-4 text-gray-600">{mitigation.explanation}</p> */}
      </CardContent>
    </Card>
  );
}
