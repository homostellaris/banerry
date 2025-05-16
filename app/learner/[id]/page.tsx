"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useParams } from "next/navigation"
import ScriptCard from "./script-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function LearnerPage() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const learnerId = params?.id as string

  useEffect(() => {
    async function fetchScripts() {
      try {
        const response = await fetch(`/api/learner/${learnerId}/scripts`)
        const data = await response.json()
        setScripts(data)
      } catch (error) {
        console.error("Error fetching scripts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScripts()
  }, [learnerId])

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">My Scripts</h1>
        <p className="text-xl text-gray-600">These are the phrases I use to communicate</p>
      </header>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-16 mb-6">
          <TabsTrigger value="all" className="text-xl py-4">
            All Scripts
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xl py-4">
            Recent Scripts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-2xl text-gray-500">Loading scripts...</div>
            </div>
          ) : (
            <div className="grid gap-6">
              {scripts.map((script) => (
                <ScriptCard key={script.id} script={script} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-2xl text-gray-500">Loading scripts...</div>
            </div>
          ) : (
            <div className="grid gap-6">
              {scripts
                .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                .slice(0, 3)
                .map((script) => (
                  <ScriptCard key={script.id} script={script} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-8 right-8">
        <Button
          size="lg"
          className="rounded-full w-16 h-16 shadow-lg bg-purple-600 hover:bg-purple-700"
          aria-label="Add new script"
        >
          <PlusCircle className="h-10 w-10" />
        </Button>
      </div>
    </div>
  )
}
