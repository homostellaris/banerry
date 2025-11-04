"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, MicOff, Plus, Clock, X } from "lucide-react";
import { generateImage } from "@/app/_tts/image-generation";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

interface BoardColumn {
  title: string;
  image?: string;
  prompt?: string;
  timerMinutes?: number;
  isActive: boolean;
}

interface BoardData {
  _id: Id<"boards">;
  _creationTime: number;
  learnerId: Id<"learners">;
  name: string;
  columns: BoardColumn[];
  isActive: boolean;
}

interface NowNextThenBoardProps {
  board: BoardData;
  learnerId: Id<"learners">;
}

export default function NowNextThenBoard({ board, learnerId }: NowNextThenBoardProps) {
  const [activeColumnIndex, setActiveColumnIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timers, setTimers] = useState<{ [key: number]: { remaining: number; total: number } }>({});

  const updateColumnImage = useMutation(api.boards.updateColumnImage);
  const setActiveColumn = useMutation(api.boards.setActiveColumn);
  const setColumnTimer = useMutation(api.boards.setColumnTimer);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setError("Speech recognition failed. Please try again.");
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Timer management
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = { ...prev };
        let hasActiveTimer = false;

        Object.keys(newTimers).forEach(key => {
          const columnIndex = parseInt(key);
          if (newTimers[columnIndex].remaining > 0) {
            newTimers[columnIndex].remaining -= 1;
            hasActiveTimer = true;
            
            // Move to next column when timer reaches 0
            if (newTimers[columnIndex].remaining === 0) {
              const nextIndex = columnIndex + 1;
              if (nextIndex < board.columns.length) {
                setActiveColumn({ boardId: board._id, columnIndex: nextIndex });
                setActiveColumnIndex(nextIndex);
              }
            }
          }
        });

        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [board._id, board.columns.length, setActiveColumn]);

  const handleColumnClick = async (index: number) => {
    setActiveColumnIndex(index);
    setInputValue("");
    setError(null);
    
    try {
      await setActiveColumn({ boardId: board._id, columnIndex: index });
    } catch (err) {
      console.error("Failed to set active column:", err);
    }
  };

  const handleGenerateImage = async () => {
    if (!inputValue.trim() || activeColumnIndex === null) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateImage(inputValue);

      if (result.success && result.imageData) {
        await updateColumnImage({
          boardId: board._id,
          columnIndex: activeColumnIndex,
          image: result.imageData,
          prompt: inputValue,
        });

        setInputValue("");
        setActiveColumnIndex(null);
      } else {
        setError(result.error || "Failed to generate image");
      }
    } catch (err) {
      console.error("Image generation failed:", err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartListening = () => {
    if (recognition && !isListening) {
      setError(null);
      setIsListening(true);
      recognition.start();
    }
  };

  const handleStopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSetTimer = async (columnIndex: number, minutes: number) => {
    try {
      await setColumnTimer({
        boardId: board._id,
        columnIndex,
        timerMinutes: minutes,
      });

      // Start the timer locally
      setTimers(prev => ({
        ...prev,
        [columnIndex]: {
          remaining: minutes * 60,
          total: minutes * 60,
        }
      }));
    } catch (err) {
      console.error("Failed to set timer:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isColumnActive = (index: number) => {
    return activeColumnIndex === index || board.columns[index]?.isActive;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {board.columns.map((column, index) => (
          <Card
            key={index}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-lg",
              isColumnActive(index) && "ring-2 ring-blue-500 shadow-lg"
            )}
            onClick={() => handleColumnClick(index)}
          >
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  {column.title}
                </h3>
                
                {/* Timer Display */}
                {timers[index] && (
                  <div className="mb-4">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTime(timers[index].remaining)}
                    </Badge>
                  </div>
                )}

                {/* Image Display */}
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {column.image ? (
                    <img
                      src={column.image}
                      alt={column.prompt || `${column.title} image`}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Plus className="w-12 h-12 mx-auto mb-2" />
                      <p>Tap to add image</p>
                    </div>
                  )}
                </div>

                {/* Prompt Display */}
                {column.prompt && (
                  <p className="text-sm text-gray-600 italic mb-4">
                    "{column.prompt}"
                  </p>
                )}

                {/* Timer Controls */}
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 5, 10, 15].map((minutes) => (
                    <Button
                      key={minutes}
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetTimer(index, minutes);
                      }}
                      className="text-xs"
                    >
                      {minutes}m
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Input Section */}
      {activeColumnIndex !== null && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold mb-4">
              Generate image for: {board.columns[activeColumnIndex]?.title}
            </h4>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe what you want to see..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isGenerating) {
                    handleGenerateImage();
                  }
                }}
              />
              
              {recognition && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={isListening ? handleStopListening : handleStartListening}
                  className={cn(
                    "transition-colors",
                    isListening && "bg-red-100 text-red-600"
                  )}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
              
              <Button
                onClick={handleGenerateImage}
                disabled={!inputValue.trim() || isGenerating}
                className="min-w-[100px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </div>

            {isListening && (
              <div className="text-center text-sm text-gray-600">
                🎤 Listening... Speak now
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}