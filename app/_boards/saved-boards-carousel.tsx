"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Trash2, Play, Pause } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

interface BoardData {
  _id: Id<"boards">;
  _creationTime: number;
  learnerId: Id<"learners">;
  name: string;
  columns: Array<{
    title: string;
    image?: string;
    prompt?: string;
    timerMinutes?: number;
    isActive: boolean;
  }>;
  isActive: boolean;
}

interface SavedBoardsCarouselProps {
  boards: BoardData[];
  learnerId: Id<"learners">;
  onBoardSelect: (board: BoardData) => void;
}

export default function SavedBoardsCarousel({
  boards,
  learnerId,
  onBoardSelect,
}: SavedBoardsCarouselProps) {
  const setActiveBoard = useMutation(api.boards.setActiveBoard);
  const deleteBoard = useMutation(api.boards.deleteBoard);
  const [deletingBoards, setDeletingBoards] = useState<Set<string>>(new Set());

  const handleBoardClick = async (board: BoardData) => {
    if (!board.isActive) {
      try {
        await setActiveBoard({
          learnerId,
          boardId: board._id,
        });
      } catch (error) {
        console.error("Failed to set active board:", error);
      }
    }
    onBoardSelect(board);
  };

  const handleDeleteBoard = async (boardId: Id<"boards">, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (deletingBoards.has(boardId)) return;
    
    setDeletingBoards(prev => new Set(prev).add(boardId));
    
    try {
      await deleteBoard({ boardId });
    } catch (error) {
      console.error("Failed to delete board:", error);
    } finally {
      setDeletingBoards(prev => {
        const newSet = new Set(prev);
        newSet.delete(boardId);
        return newSet;
      });
    }
  };

  if (boards.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Saved Boards</h3>
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        {boards.map((board) => (
          <Card
            key={board._id}
            className={cn(
              "flex-shrink-0 w-80 cursor-pointer transition-all duration-300 hover:shadow-lg",
              board.isActive && "ring-2 ring-green-500 shadow-lg"
            )}
            onClick={() => handleBoardClick(board)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 truncate">
                    {board.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {new Date(board._creationTime).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {board.isActive && (
                    <Badge variant="default" className="text-xs">
                      <Play className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteBoard(board._id, e)}
                        className="text-red-600"
                        disabled={deletingBoards.has(board._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletingBoards.has(board._id) ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Preview of board columns */}
              <div className="grid grid-cols-3 gap-2">
                {board.columns.map((column, index) => (
                  <div key={index} className="text-center">
                    <div className="w-full h-16 bg-gray-100 rounded mb-1 flex items-center justify-center overflow-hidden">
                      {column.image ? (
                        <img
                          src={column.image}
                          alt={column.title}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">
                          {column.title}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {column.title}
                    </p>
                    {column.timerMinutes && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {column.timerMinutes}m
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}