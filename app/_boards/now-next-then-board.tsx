"use client";

import { generateImage, ImageStyle } from "@/app/_image-generation/image-generation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Camera, Clock, Mic, Palette, Plus, Timer, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function StorageImage({
  storageId,
  alt,
  className,
}: {
  storageId: Id<"_storage">;
  alt: string;
  className: string;
}) {
  const imageUrl = useQuery(api.boards.getImageUrl, { storageId });

  if (!imageUrl) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return <img src={imageUrl} alt={alt} className={className} />;
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

interface NowNextThenBoardProps {
  board?: Board;
  learnerId: Id<"learners">;
  onBoardUpdate?: () => void;
  readOnly?: boolean;
}

const STYLE_OPTIONS: Array<{ value: ImageStyle; label: string; description: string }> = [
  { value: "studio-ghibli", label: "Studio Ghibli", description: "Digital art with vibrant colors and soft lighting" },
  { value: "play-doh", label: "Play-Doh", description: "Soft tactile textures with vibrant colors" },
  { value: "ladybird", label: "Ladybird Books", description: "Classic 1960s British illustration style" },
];

export function NowNextThenBoard({
  board,
  learnerId,
  onBoardUpdate,
  readOnly = false,
}: NowNextThenBoardProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [activeColumn, setActiveColumn] = useState<string>("now");
  const [isListening, setIsListening] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>("studio-ghibli");

  useEffect(() => {
    const savedStyle = localStorage.getItem("board-image-style");
    if (savedStyle && ["studio-ghibli", "play-doh", "ladybird"].includes(savedStyle)) {
      setSelectedStyle(savedStyle as ImageStyle);
    }
  }, []);

  const handleStyleChange = (style: ImageStyle) => {
    setSelectedStyle(style);
    localStorage.setItem("board-image-style", style);
  };

  const updateColumnImage = useMutation(api.boards.updateColumnImage);
  const updateColumnTimer = useMutation(api.boards.updateColumnTimer);
  const generateUploadUrl = useMutation(api.boards.generateUploadUrl);

  const handleGenerateImage = async (columnId: string, prompt: string) => {
    if (!board) {
      toast.error("Please create a board first");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt for image generation");
      return;
    }

    setIsGenerating(columnId);

    try {
      const result = await generateImage(prompt, "1024x1024", selectedStyle);

      if (result.success) {
        const base64Response = await fetch(
          `data:image/png;base64,${result.imageData}`
        );
        const blob = await base64Response.blob();

        const uploadUrl = await generateUploadUrl();
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type },
          body: blob,
        });

        const { storageId } = await uploadResponse.json();

        await updateColumnImage({
          boardId: board._id,
          columnId,
          imageStorageId: storageId,
          imagePrompt: prompt,
        });

        toast.success("Image generated successfully!");
        onBoardUpdate?.();
      } else {
        toast.error(result.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(null);
      setPromptInput("");
    }
  };

  const handleSetTimer = async (columnId: string, minutes: number) => {
    if (!board) {
      toast.error("Please create a board first");
      return;
    }

    await updateColumnTimer({
      boardId: board._id,
      columnId,
      timerDuration: minutes * 60,
    });

    toast.success(`Timer set for ${minutes} minute(s)`);
    onBoardUpdate?.();
  };

  const handleVoiceInput = async (columnId: string) => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error("Speech recognition is not supported in this browser");
      return;
    }

    setIsListening(true);
    setActiveColumn(columnId);

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPromptInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      toast.error("Speech recognition failed");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!board) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-purple-700 mb-2">
          {board.name}
        </h2>
        {!readOnly && (
          <p className="text-gray-600">Tap on a section to generate an image</p>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-center justify-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Image Style:</span>
          <Select value={selectedStyle} onValueChange={handleStyleChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STYLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {board.columns
          .sort((a, b) => a.position - b.position)
          .map((column) => (
            <Card
              key={column.id}
              className={`relative transition-all duration-300 ${
                !readOnly && "hover:shadow-lg"
              } ${
                activeColumn === column.id && !readOnly
                  ? "ring-2 ring-purple-500 shadow-lg"
                  : ""
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
                <div
                  className={`relative aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 transition-colors ${
                    !readOnly ? "hover:border-purple-400 cursor-pointer" : ""
                  }`}
                  onClick={() => !readOnly && setActiveColumn(column.id)}
                >
                  {column.imageStorageId ? (
                    <StorageImage
                      storageId={column.imageStorageId}
                      alt={column.imagePrompt || "Generated image"}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Tap to add image
                        </p>
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

                {!readOnly && activeColumn === column.id && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Describe what you want to see..."
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && promptInput.trim()) {
                            handleGenerateImage(column.id, promptInput);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleVoiceInput(column.id)}
                        disabled={isListening}
                        className={isListening ? "animate-pulse" : ""}
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
                        onClick={() =>
                          handleGenerateImage(column.id, promptInput)
                        }
                        disabled={
                          !promptInput.trim() || isGenerating === column.id
                        }
                        className="flex-1"
                        size="sm"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Generate Image
                      </Button>
                    </div>

                    <div className="flex gap-1 flex-wrap">
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
              </CardContent>
            </Card>
          ))}
      </div>

      {!readOnly && (
        <div className="text-center">
          <Button variant="outline" className="w-full max-w-xs">
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
      )}
    </div>
  );
}
