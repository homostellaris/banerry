import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import MitigationCard from "@/app/components/mitigation-card"
import { scripts } from "@/app/data/scripts"
import { Suspense } from "react"
import MitigationsLoading from "@/app/components/mitigations-loading"
import { generateMitigations } from "@/app/actions/mitigations"

async function MitigationsSection({ scriptText }: { scriptText: string }) {
  try {
    const mitigations = await generateMitigations(scriptText)

    return (
      <div className="grid gap-6">
        {mitigations.map((mitigation) => (
          <MitigationCard key={mitigation.id} mitigation={mitigation} originalScript={scriptText} />
        ))}
      </div>
    )
  } catch (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error instanceof Error ? error.message : "An unknown error occurred"}</AlertDescription>
      </Alert>
    )
  }
}

export default function ScriptPage({ params }: { params: { id: string } }) {
  const scriptId = params.id

  // Get the script directly from our data
  const script = scripts.find((s) => s.id === scriptId)

  if (!script) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Script not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <Suspense fallback={<MitigationsLoading />}>
      <MitigationsSection scriptText={script.text} />
    </Suspense>
  )
}
