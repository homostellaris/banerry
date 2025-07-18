"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import Link from "next/link"

interface LearnerCardProps {
  learner: {
    _id: string
    name: string
    bio?: string
    _creationTime: number
  }
}

export default function LearnerCard({ learner }: LearnerCardProps) {
  return (
    <Link href={`/mentor/learner/${learner._id}`} className="block">
      <Card className="overflow-hidden border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-700" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">
              {learner.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* TODO: Change this to last activity */}
          <p className="text-xs text-gray-400">
            Created {new Date(learner._creationTime).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
