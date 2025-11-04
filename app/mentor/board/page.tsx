"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Users } from "lucide-react";
import NowNextThenBoard from "@/app/_boards/now-next-then-board";
import SavedBoardsCarousel from "@/app/_boards/saved-boards-carousel";
import { Id } from "@/convex/_generated/dataModel";

export default function MentorBoardPage() {
  const [selectedLearnerId, setSelectedLearnerId] = useState<Id<"learners"> | null>(null);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);

  // Get all learners for this mentor
  const learners = useQuery(api.learners.list);

  // Get boards for selected learner
  const boards = useQuery(
    api.boards.listBoards,
    selectedLearnerId ? { learnerId: selectedLearnerId } : "skip"
  );

  // Get active board for selected learner
  const activeBoard = useQuery(
    api.boards.getActiveBoard,
    selectedLearnerId ? { learnerId: selectedLearnerId } : "skip"
  );

  const createBoard = useMutation(api.boards.createBoard);

  // Auto-select first learner if available
  useEffect(() => {
    if (learners && learners.length > 0 && !selectedLearnerId) {
      setSelectedLearnerId(learners[0]._id);
    }
  }, [learners, selectedLearnerId]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !selectedLearnerId || isCreatingBoard) return;

    setIsCreatingBoard(true);
    try {
      await createBoard({
        learnerId: selectedLearnerId,
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

  const selectedLearner = learners?.find(l => l._id === selectedLearnerId);

  if (!learners) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (learners.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">
            Now, Next, Then Board
          </h1>
          <p className="text-gray-600">Visual planning and organization</p>
        </header>

        <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Learners Found
            </h2>
            <p className="text-gray-500 max-w-md">
              You need to add learners before you can create boards for them.
            </p>
          </div>
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
        <p className="text-gray-600">Visual planning and organization</p>
      </header>

      {/* Learner Selection */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium whitespace-nowrap">
                Select Learner:
              </label>
              <Select
                value={selectedLearnerId || ""}
                onValueChange={(value) => setSelectedLearnerId(value as Id<"learners">)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose a learner..." />
                </SelectTrigger>
                <SelectContent>
                  {learners.map((learner) => (
                    <SelectItem key={learner._id} value={learner._id}>
                      {learner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLearner && (
                <span className="text-sm text-gray-600">
                  Passphrase: <code className="bg-gray-100 px-2 py-1 rounded">{selectedLearner.passphrase}</code>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedLearnerId && (
        <>
          {/* Saved Boards Carousel */}
          {boards && boards.length > 0 && (
            <SavedBoardsCarousel
              boards={boards}
              learnerId={selectedLearnerId}
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
            <NowNextThenBoard board={activeBoard} learnerId={selectedLearnerId} />
          ) : (
            <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  No Active Board
                </h2>
                <p className="text-gray-500 max-w-md">
                  Create a new board or select an existing one to start organizing
                  activities and transitions for {selectedLearner?.name}.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
