"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Calendar, Plus } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

interface BoardColumn {
  id: string
  title: string
  imageUrl?: string
  imagePrompt?: string
  timerDuration?: number
  position: number
}

interface Board {
  _id: Id<"boards">
  name: string
  columns: BoardColumn[]
  isActive: boolean
  createdAt: number
}

interface SavedBoardsCarouselProps {
  boards: Board[]
  learnerId: Id<"learners">
  onBoardSelect?: (board: Board) => void
}

export function SavedBoardsCarousel({ boards, learnerId, onBoardSelect }: SavedBoardsCarouselProps) {
  const setActiveBoard = useMutation(api.boards.setActiveBoard)
  const createBoard = useMutation(api.boards.createBoard)

  const handleSelectBoard = async (board: Board) => {
    try {
      await setActiveBoard({
        learnerId,
        boardId: board._id,
      })
      
      onBoardSelect?.(board)
      toast.success(`Switched to "${board.name}"`)
    } catch (error) {
      console.error("Error selecting board:", error)
      toast.error("Failed to switch board")
    }
  }

  const handleCreateNewBoard = async () => {
    try {
      const boardId = await createBoard({
        learnerId,
        name: `Board ${boards.length + 1}`,
      })
      
      toast.success("New board created!")
      // The parent component should refresh the boards list
    } catch (error) {
      console.error("Error creating board:", error)
      toast.error("Failed to create new board")
    }
  }

  if (boards.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-6">
        <h3 className="text-lg font-semibold mb-3">Saved Boards</h3>
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No saved boards yet</p>
              <Button onClick={handleCreateNewBoard} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Board
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Saved Boards</h3>
        <Button onClick={handleCreateNewBoard} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Board
        </Button>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {boards.map((board) => (
            <CarouselItem key={board._id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  board.isActive ? 'ring-2 ring-purple-500 shadow-lg' : ''
                }`}
                onClick={() => handleSelectBoard(board)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Board Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate flex-1">{board.name}</h4>
                      {board.isActive && (
                        <Badge variant="default" className="ml-2">Active</Badge>
                      )}
                    </div>
                    
                    {/* Board Preview */}
                    <div className="grid grid-cols-3 gap-1">
                      {board.columns
                        .sort((a, b) => a.position - b.position)
                        .map((column) => (
                          <div key={column.id} className="aspect-square">
                            {column.imageUrl ? (
                              <img 
                                src={column.imageUrl} 
                                alt={column.title}
                                className="w-full h-full object-cover rounded border"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 rounded border flex items-center justify-center">
                                <Calendar className="h-3 w-3 text-gray-400" />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                    
                    {/* Board Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{board.columns.length} columns</span>
                      <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
  )
}