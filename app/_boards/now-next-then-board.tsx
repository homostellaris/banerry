"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Camera, Clock, Mic, Plus, Timer, Volume2 } from "lucide-react"
import { generateImage } from "@/app/_tts/image-generation"
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

interface NowNextThenBoardProps {
  board?: Board
  learnerId: Id<"learners">
  onBoardUpdate?: () => void
}

export function NowNextThenBoard({ board, learnerId, onBoardUpdate }: NowNextThenBoardProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [promptInput, setPromptInput] = useState("")
  const [activeColumn, setActiveColumn] = useState<string>("now")
  const [isListening, setIsListening] = useState(false)

  const updateColumnImage = useMutation(api.boards.updateColumnImage)
  const updateColumnTimer = useMutation(api.boards.updateColumnTimer)
  const createBoard = useMutation(api.boards.createBoard)

  // Create default board if none exists
  const currentBoard = board || {
    _id: undefined as any,
    name: "My Board",
    columns: [
      { id: "now", title: "Now", position: 0 },
      { id: "next", title: "Next", position: 1 },
      { id: "then", title: "Then", position: 2 },
    ],
    isActive: true,
    createdAt: Date.now(),
  }

  const handleGenerateImage = async (columnId: string, prompt: string) => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt for image generation")
      return
    }

    setIsGenerating(columnId)
    
    try {
      const result = await generateImage(prompt)
      
      if (result.success) {
        // Create board if it doesn't exist
        let boardId = currentBoard._id
        if (!boardId) {
          boardId = await createBoard({
            learnerId,
            name: "My Board",
            columns: currentBoard.columns,
          })
        }

        // Convert base64 to data URL
        const imageUrl = `data:image/png;base64,${result.imageData}`
        
        await updateColumnImage({
          boardId,
          columnId,
          imageUrl,
          imagePrompt: prompt,
        })
        
        toast.success("Image generated successfully!")
        onBoardUpdate?.()
      } else {
        toast.error(result.error || "Failed to generate image")
      }
    } catch (error) {
      console.error("Error generating image:", error)
      toast.error("Failed to generate image")
    } finally {
      setIsGenerating(null)
      setPromptInput("")
    }
  }

  const handleSetTimer = async (columnId: string, minutes: number) => {
    if (!currentBoard._id) {
      // Create board first
      const boardId = await createBoard({
        learnerId,
        name: "My Board",
        columns: currentBoard.columns,
      })
      
      await updateColumnTimer({
        boardId,
        columnId,
        timerDuration: minutes * 60,
      })
    } else {
      await updateColumnTimer({
        boardId: currentBoard._id,
        columnId,
        timerDuration: minutes * 60,
      })
    }
    
    toast.success(`Timer set for ${minutes} minute(s)`)
    onBoardUpdate?.()
  }

  const handleVoiceInput = async (columnId: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in this browser")
      return
    }

    setIsListening(true)
    setActiveColumn(columnId)

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setPromptInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      toast.error("Speech recognition failed")
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-purple-700 mb-2">{currentBoard.name}</h2>
        <p className="text-gray-600">Tap on a section to generate an image</p>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentBoard.columns
          .sort((a, b) => a.position - b.position)
          .map((column) => (
            <Card 
              key={column.id} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                activeColumn === column.id ? 'ring-2 ring-purple-500 shadow-lg' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-xl font-semibold">
                  {column.title}
                </CardTitle>
                {column.timerDuration && (
                  <Badge variant="secondary" className="mx-auto w-fit">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.round(column.timerDuration / 60)}m
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Image Display Area */}
                <div 
                  className="relative aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 cursor-pointer transition-colors"
                  onClick={() => setActiveColumn(column.id)}
                >
                  {column.imageUrl ? (
                    <img 
                      src={column.imageUrl} 
                      alt={column.imagePrompt || "Generated image"} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Tap to add image</p>
                      </div>
                    </div>
                  )}
                  
                  {isGenerating === column.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-sm">Generating...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Controls */}
                {activeColumn === column.id && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Describe what you want to see..."
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && promptInput.trim()) {
                            handleGenerateImage(column.id, promptInput)
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleVoiceInput(column.id)}
                        disabled={isListening}
                        className={isListening ? 'animate-pulse' : ''}
                      >
                        {isListening ? (
                          <Volume2 className="h-4 w-4 text-red-500" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerateImage(column.id, promptInput)}
                        disabled={!promptInput.trim() || isGenerating === column.id}
                        className="flex-1"
                        size="sm"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Generate Image
                      </Button>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex gap-1">
                      {[1, 5, 10, 15].map((minutes) => (
                        <Button
                          key={minutes}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetTimer(column.id, minutes)}
                          className="flex-1 text-xs"
                        >
                          <Timer className="h-3 w-3 mr-1" />
                          {minutes}m
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show prompt if image exists */}
                {column.imagePrompt && (
                  <p className="text-xs text-gray-500 text-center italic">
                    "{column.imagePrompt}"
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Add Column Button */}
      <div className="text-center">
        <Button variant="outline" className="w-full max-w-xs">
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>
    </div>
  )
}