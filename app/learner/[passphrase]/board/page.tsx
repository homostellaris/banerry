"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { SavedBoardsCarousel } from "@/app/_boards/saved-boards-carousel"
import { NowNextThenBoard } from "@/app/_boards/now-next-then-board"
import { useState, useEffect } from "react"
import { Id } from "@/convex/_generated/dataModel"

export default function BoardPage({
  params,
}: {
  params: Promise<{ passphrase: string }>
}) {
  const [passphrase, setPassphrase] = useState<string>("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    params.then(p => setPassphrase(p.passphrase))
  }, [params])

  // Get learner by passphrase
  const learner = useQuery(api.learners.getLearnerByPassphrase, 
    passphrase ? { passphrase } : "skip"
  )

  // Get boards for this learner
  const boards = useQuery(api.boards.getBoards, 
    learner?._id ? { learnerId: learner._id } : "skip"
  )

  // Get active board
  const activeBoard = useQuery(api.boards.getActiveBoard,
    learner?._id ? { learnerId: learner._id } : "skip"
  )

  const handleBoardUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!learner) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
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

      {/* Saved Boards Carousel */}
      {boards && (
        <SavedBoardsCarousel
          boards={boards}
          learnerId={learner._id}
          onBoardSelect={handleBoardUpdate}
        />
      )}

      {/* Active Board */}
      <NowNextThenBoard
        board={activeBoard || undefined}
        learnerId={learner._id}
        onBoardUpdate={handleBoardUpdate}
      />
    </div>
  )
}
