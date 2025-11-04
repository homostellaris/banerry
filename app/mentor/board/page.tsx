"use client"

import { useUser } from "@convex-dev/auth/react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { SavedBoardsCarousel } from "@/app/_boards/saved-boards-carousel"
import { NowNextThenBoard } from "@/app/_boards/now-next-then-board"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MentorBoardPage() {
  const { user } = useUser()
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>("")
  const [refreshKey, setRefreshKey] = useState(0)

  // Get learners for this mentor
  const learners = useQuery(api.learners.getLearnersByMentor, 
    user ? { mentorId: user._id } : "skip"
  )

  // Get boards for selected learner
  const boards = useQuery(api.boards.getBoards, 
    selectedLearnerId ? { learnerId: selectedLearnerId as any } : "skip"
  )

  // Get active board for selected learner
  const activeBoard = useQuery(api.boards.getActiveBoard,
    selectedLearnerId ? { learnerId: selectedLearnerId as any } : "skip"
  )

  const handleBoardUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center">
          <p className="text-gray-500">Please sign in to access boards.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">
          Now, Next, Then Board
        </h1>
        <p className="text-gray-600">Visual planning and organization</p>
      </header>

      {/* Learner Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Learner</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedLearnerId} value={selectedLearnerId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a learner to view their boards" />
            </SelectTrigger>
            <SelectContent>
              {learners?.map((learner) => (
                <SelectItem key={learner._id} value={learner._id}>
                  {learner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedLearnerId && (
        <>
          {/* Saved Boards Carousel */}
          {boards && (
            <SavedBoardsCarousel
              boards={boards}
              learnerId={selectedLearnerId as any}
              onBoardSelect={handleBoardUpdate}
            />
          )}

          {/* Active Board */}
          <NowNextThenBoard
            board={activeBoard || undefined}
            learnerId={selectedLearnerId as any}
            onBoardUpdate={handleBoardUpdate}
          />
        </>
      )}
    </div>
  )
}
