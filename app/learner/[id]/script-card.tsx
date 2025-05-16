"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"
import Link from "next/link"

interface ScriptProps {
  script: {
    id: string
    text: string
    meanings: {
      id: string
      text: string
      context: string
    }[]
    dateAdded: string
  }
}

export default function ScriptCard({ script }: ScriptProps) {
  const playAudio = () => {
    // In a real app, this would play the recorded audio
    // For now, we'll use the browser's speech synthesis
    const utterance = new SpeechSynthesisUtterance(script.text)
    speechSynthesis.speak(utterance)
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
              onClick={(e) => {
                e.preventDefault() // Prevent navigation when clicking the button
                playAudio()
              }}
              aria-label="Play script audio"
            >
              <Volume2 className="h-6 w-6 text-purple-700" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
