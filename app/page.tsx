import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 text-center pr-20">
      <h1 className="text-5xl font-bold text-purple-700 mb-6">Gestalt Speech Therapy</h1>
      <p className="text-2xl text-gray-600 max-w-2xl mb-10">
        A tool to help children who are gestalt language processors develop their speech
      </p>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Demo Learner Pages:</h2>
        <div className="flex flex-col gap-4">
          <Link href="/learner/1">
            <Button className="text-xl py-6 px-8 w-full max-w-md">View Learner 1</Button>
          </Link>
          <Link href="/learner/2">
            <Button className="text-xl py-6 px-8 w-full max-w-md" variant="outline">
              View Learner 2
            </Button>
          </Link>
        </div>
      </div>

      <p className="mt-16 text-gray-500 max-w-2xl">
        This is a demo version without login functionality. In the full version, carers will be able to login, register
        learners, and record scripts.
      </p>
    </div>
  )
}
