"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Volume2, AlertCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import MitigationCard from "./mitigation-card"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Script {
  id: string
  text: string
  meanings: {
    id: string
    text: string
    context: string
  }[]
  dateAdded: string
}

interface Mitigation {
  id: string
  text: string
  explanation: string
}

export default function ScriptPage() {
  const [script, setScript] = useState<Script | null>(null)
  const [mitigations, setMitigations] = useState<Mitigation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const scriptId = params?.id as string

  useEffect(() => {
    async function fetchScriptAndMitigations() {
      try {
        // Fetch the script
        const scriptResponse = await fetch(`/api/script/${scriptId}`)
        if (!scriptResponse.ok) {
          throw new Error(`Failed to fetch script: ${scriptResponse.statusText}`)
        }
        const scriptData = await scriptResponse.json()
        setScript(scriptData)

        // Fetch the mitigations
        const mitigationsResponse = await fetch(`/api/script/${scriptId}/mitigate`)
        if (!mitigationsResponse.ok) {
          const errorData = await mitigationsResponse.json()
          throw new Error(`Failed to fetch mitigations: ${errorData.error || mitigationsResponse.statusText}`)
        }
        const mitigationsData = await mitigationsResponse.json()
        setMitigations(mitigationsData)
      } catch (error) {
        console.error("Error:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchScriptAndMitigations()
  }, [scriptId])

  const playAudio = () => {
    if (script) {
      const utterance = new SpeechSynthesisUtterance(script.text)
      speechSynthesis.speak(utterance)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-2xl text-gray-500">Loading script...</div>
        </div>
      </div>
    )
  }

  if (!script) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="text-2xl text-gray-500">Script not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link href={`/learner/1`} className="inline-flex items-center text-xl text-purple-600 mb-6">
        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Scripts
      </Link>

      <header className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-purple-700">{script.text}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-14 w-14 flex-shrink-0 bg-purple-100 hover:bg-purple-200"
            onClick={playAudio}
            aria-label="Play script audio"
          >
            <Volume2 className="h-8 w-8 text-purple-700" />
          </Button>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Try these variations:</h2>

        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button variant="outline" onClick={() => window.location.reload()} className="text-lg py-4 px-6">
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6">
            {mitigations.map((mitigation) => (
              <MitigationCard key={mitigation.id} mitigation={mitigation} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
