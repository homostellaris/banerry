"use client";

import { NowNextThenBoard } from "@/app/_boards/now-next-then-board";
import { SavedBoardsCarousel } from "@/app/_boards/saved-boards-carousel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

export default function BoardPage({
  params,
}: {
  params: Promise<{ passphrase: string }>;
}) {
  const [passphrase, setPassphrase] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    params.then((p) => setPassphrase(p.passphrase));
  }, [params]);
  const learner = useQuery(
    api.learners.getLearnerByPassphrase,
    passphrase ? { passphrase } : "skip"
  );
  const boards = useQuery(
    api.boards.getBoards,
    learner?._id ? { learnerId: learner._id } : "skip"
  );
  const activeBoard = useQuery(
    api.boards.getActiveBoard,
    learner?._id ? { learnerId: learner._id } : "skip"
  );

  const handleBoardUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!learner) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {boards && (
        <SavedBoardsCarousel
          boards={boards}
          learnerId={learner._id}
          onBoardSelect={handleBoardUpdate}
          readOnly={true}
        />
      )}
      <NowNextThenBoard
        board={activeBoard || undefined}
        learnerId={learner._id}
        onBoardUpdate={handleBoardUpdate}
        readOnly={true}
      />
    </div>
  );
}
