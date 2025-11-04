"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import NowNextThenBoard from "@/app/_boards/now-next-then-board";
import SavedBoardsCarousel from "@/app/_boards/saved-boards-carousel";
import { Id } from "@/convex/_generated/dataModel";

interface BoardPageProps {
  params: Promise<{ passphrase: string }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const [passphrase, setPassphrase] = useState<string>("");
  const [learner, setLearner] = useState<any>(null);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);

  // Get passphrase from params
  useEffect(() => {
    params.then(({ passphrase }) => setPassphrase(passphrase));
  }, [params]);

  // Get learner data
  const learnerData = useQuery(
    api.learners.getByPassphrase,
    passphrase ? { passphrase } : "skip"
  );

  // Get boards for this learner
  const boards = useQuery(
    api.boards.listBoards,
    learner ? { learnerId: learner._id } : "skip"
  );

  // Get active board
  const activeBoard = useQuery(
    api.boards.getActiveBoard,
    learner ? { learnerId: learner._id } : "skip"
  );

  const createBoard = useMutation(api.boards.createBoard);

  useEffect(() => {
    if (learnerData) {
      setLearner(learnerData);
    }
  }, [learnerData]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !learner || isCreatingBoard) return;

    setIsCreatingBoard(true);
    try {
      await createBoard({
        learnerId: learner._id,
        name: newBoardName.trim(),
      });
      setNewBoardName("");
      setShowNewBoardForm(false);
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setIsCreatingBoard(false);
    }
  };

  const handleBoardSelect = (board: any) => {
    // Board selection is handled by the carousel component
    // The active board will update automatically via the query
  };

  if (!learner) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">
          Now, Next, Then Board
        </h1>
        <p className="text-gray-600">Visual planning and organization for {learner.name}</p>
      </header>

      {/* Saved Boards Carousel */}
      {boards && boards.length > 0 && (
        <SavedBoardsCarousel
          boards={boards}
          learnerId={learner._id}
          onBoardSelect={handleBoardSelect}
        />
      )}

      {/* Create New Board Section */}
      <div className="mb-6">
        {!showNewBoardForm ? (
          <Button
            onClick={() => setShowNewBoardForm(true)}
            variant="outline"
            className="w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Board
          </Button>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Enter board name..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isCreatingBoard) {
                      handleCreateBoard();
                    }
                  }}
                />
                <Button
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim() || isCreatingBoard}
                >
                  {isCreatingBoard ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewBoardForm(false);
                    setNewBoardName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Board or Empty State */}
      {activeBoard ? (
        <NowNextThenBoard board={activeBoard} learnerId={learner._id} />
      ) : (
        <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Active Board
            </h2>
            <p className="text-gray-500 max-w-md">
              Create a new board or select an existing one to start organizing your
              daily activities and transitions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
