"use client";

import { NowNextThenBoard } from "@/app/_boards/now-next-then-board";
import { SavedBoardsCarousel } from "@/app/_boards/saved-boards-carousel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function MentorBoardPage() {
  const { id: selectedLearnerId } = useParams();
  const user = useQuery(api.auth.currentUser);
  const [refreshKey, setRefreshKey] = useState(0);

  const learners = useQuery(
    api.learners.getLearnersByMentor,
    user ? { mentorId: user._id } : "skip"
  );

  const boards = useQuery(
    api.boards.getBoards,
    selectedLearnerId ? { learnerId: selectedLearnerId as any } : "skip"
  );

  const activeBoard = useQuery(
    api.boards.getActiveBoard,
    selectedLearnerId ? { learnerId: selectedLearnerId as any } : "skip"
  );

  const handleBoardUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center">
          <p className="text-gray-500">Please sign in to access boards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {boards && (
        <SavedBoardsCarousel
          boards={boards}
          learnerId={selectedLearnerId as any}
          onBoardSelect={handleBoardUpdate}
        />
      )}
      <NowNextThenBoard
        board={activeBoard || undefined}
        learnerId={selectedLearnerId as any}
        onBoardUpdate={handleBoardUpdate}
      />
    </div>
  );
}
