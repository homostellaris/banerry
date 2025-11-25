"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Columns3, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

function StorageImagePreview({ storageId }: { storageId: Id<"_storage"> }) {
  const imageUrl = useQuery(api.boards.getImageUrl, { storageId });

  if (!imageUrl) {
    return (
      <div className="w-full h-full bg-gray-100 rounded border flex items-center justify-center">
        <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-500"></div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Board preview"
      className="w-full h-full object-cover rounded border"
    />
  );
}

interface BoardColumn {
  id: string;
  title: string;
  imageStorageId?: Id<"_storage">;
  imagePrompt?: string;
  timerDuration?: number;
  position: number;
}

interface Board {
  _id: Id<"boards">;
  name: string;
  columns: BoardColumn[];
  isActive: boolean;
  createdAt: number;
}

interface SavedBoardsCarouselProps {
  boards: Board[];
  learnerId: Id<"learners">;
  onBoardSelect?: (board: Board) => void;
  readOnly?: boolean;
}

export function SavedBoardsCarousel({
  boards,
  learnerId,
  onBoardSelect,
  readOnly = false,
}: SavedBoardsCarouselProps) {
  const setActiveBoard = useMutation(api.boards.setActiveBoard);
  const createBoard = useMutation(api.boards.createBoard);
  const deleteBoard = useMutation(api.boards.deleteBoard);
  const renameBoard = useMutation(api.boards.renameBoard);

  const handleSelectBoard = async (board: Board) => {
    try {
      await setActiveBoard({
        learnerId,
        boardId: board._id,
      });

      onBoardSelect?.(board);
    } catch (error) {
      console.error("Error selecting board:", error);
      toast.error("Failed to switch board");
    }
  };

  const handleCreateNewBoard = async () => {
    try {
      const boardId = await createBoard({
        learnerId,
        name: `Board ${boards.length + 1}`,
      });

      toast.success("New board created!");
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create new board");
    }
  };

  const handleDeleteBoard = async (
    boardId: Id<"boards">,
    boardName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${boardName}"?`)) {
      return;
    }

    try {
      await deleteBoard({ boardId });
      toast.success("Board deleted");
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Failed to delete board");
    }
  };

  const handleRenameBoard = async (
    boardId: Id<"boards">,
    currentName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const newName = prompt("Enter new board name:", currentName);
    if (!newName || newName === currentName) {
      return;
    }

    try {
      await renameBoard({ boardId, name: newName });
      toast.success("Board renamed");
    } catch (error) {
      console.error("Error renaming board:", error);
      toast.error("Failed to rename board");
    }
  };

  if (boards.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-6">
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Columns3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No saved boards yet</p>
              {!readOnly && (
                <Button onClick={handleCreateNewBoard} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Board
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="flex items-center justify-between mb-3">
        {!readOnly && (
          <Button onClick={handleCreateNewBoard} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Board
          </Button>
        )}
      </div>

      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {boards.map((board) => (
            <CarouselItem
              key={board._id}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <div className={board.isActive ? "p-0.5" : ""}>
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    board.isActive ? "ring-2 ring-purple-500 shadow-lg" : ""
                  }`}
                  onClick={() => handleSelectBoard(board)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium truncate flex-1">
                          {board.name}
                        </h4>
                        {!readOnly && (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={(e) =>
                                handleRenameBoard(board._id, board.name, e)
                              }
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) =>
                                handleDeleteBoard(board._id, board.name, e)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        {board.columns
                          .sort((a, b) => a.position - b.position)
                          .map((column) => (
                            <div key={column.id} className="aspect-square">
                              {column.imageStorageId ? (
                                <StorageImagePreview
                                  storageId={column.imageStorageId}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 rounded border flex items-center justify-center">
                                  <Columns3 className="h-3 w-3 text-gray-400" />
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {boards.length > 3 && (
          <>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </>
        )}
      </Carousel>
    </div>
  );
}
