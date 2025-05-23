import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import ScriptTabs from "@/app/components/script-tabs"
import { scripts } from "@/app/data/scripts"

export default function LearnerPage({ params }: { params: { id: string } }) {
  const learnerId = params.id

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">My Scripts</h1>
        <p className="text-xl text-gray-600">These are the phrases I use to communicate</p>
      </header>

      <ScriptTabs scripts={scripts} />

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
