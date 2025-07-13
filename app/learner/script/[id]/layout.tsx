import type React from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { scripts } from "@/app/data/scripts"
import AudioButton from "@/app/components/audio-button"

export default function ScriptLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const scriptId = params.id
  const script = scripts.find((s) => s.id === scriptId)

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link href={`/learner/1`} className="inline-flex items-center text-xl text-purple-600 mb-6">
        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Scripts
      </Link>

      {script && (
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-purple-700">{script.text}</h1>
            <AudioButton text={script.text} />
          </div>
        </header>
      )}

      <main className="min-h-[400px]">{children}</main>
    </div>
  )
}
