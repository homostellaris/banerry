"use client";

import {
  generateImage,
  generateBoardImages,
  ImageStyle,
} from "@/app/_image-generation/image-generation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Camera, Clock, Loader2, Mic, Palette, Pencil, Plus, Sparkles, Timer, Trash2, Volume2, Info, Check, X } from "lucide-react";
import posthog from "posthog-js";
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
  generationPrompt?: string;
}

interface NowNextThenBoardProps {
  board?: Board;
  learnerId: Id<"learners">;
  avatarImageUrl?: string | null;
  avatarPrompt?: string;
  onBoardUpdate?: () => void;
  readOnly?: boolean;
}

const STYLE_OPTIONS: Array<{ value: ImageStyle; label: string; description: string }> = [
  { value: "studio-ghibli", label: "Studio Ghibli", description: "Digital art with vibrant colors and soft lighting" },
  { value: "play-doh", label: "Play-Doh", description: "Soft tactile textures with vibrant colors" },
  { value: "ladybird", label: "Ladybird Books", description: "Classic 1960s British illustration style" },
  { value: "symbols", label: "Symbols (AAC)", description: "Simple AAC-style symbols" },
];

function getGridClasses(columnCount: number): string {
  if (columnCount <= 1) return "grid-cols-1 max-w-sm mx-auto";
  if (columnCount === 2) return "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto";
  if (columnCount === 3) return "grid-cols-1 md:grid-cols-3";
  if (columnCount === 4) return "grid-cols-2 lg:grid-cols-4";
  if (columnCount === 5) return "grid-cols-2 lg:grid-cols-5";
  return "grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
}

export function NowNextThenBoard({
  board,
  learnerId: _learnerId,
  avatarImageUrl,
  avatarPrompt,
  onBoardUpdate,
  readOnly = false,
}: NowNextThenBoardProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>("studio-ghibli");
  const [boardPrompt, setBoardPrompt] = useState("");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const hasAvatar = !!avatarImageUrl;

  useEffect(() => {
    const savedStyle = localStorage.getItem("board-image-style");
    if (savedStyle && ["studio-ghibli", "play-doh", "ladybird", "symbols"].includes(savedStyle)) {
      setSelectedStyle(savedStyle as ImageStyle);
    }
  }, []);

  const handleStyleChange = (style: ImageStyle) => {
    setSelectedStyle(style);
    localStorage.setItem("board-image-style", style);
  };

  const updateColumnImage = useMutation(api.boards.updateColumnImage);
  const updateColumnTimer = useMutation(api.boards.updateColumnTimer);
  const updateAllColumnImages = useMutation(api.boards.updateAllColumnImages);
  const generateUploadUrl = useMutation(api.boards.generateUploadUrl);
  const addColumn = useMutation(api.boards.addColumn);
  const deleteColumn = useMutation(api.boards.deleteColumn);
  const updateColumnTitle = useMutation(api.boards.updateColumnTitle);

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
      const result = await generateImage(
        prompt,
        "1024x1024",
        selectedStyle,
        selectedStyle !== "symbols" ? (avatarImageUrl ?? undefined) : undefined
      );

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

  const handleAddColumn = async () => {
    if (!board) {
      toast.error("Please create a board first");
      return;
    }

    try {
      await addColumn({ boardId: board._id });
      toast.success("Column added");
      onBoardUpdate?.();
    } catch (error) {
      console.error("Error adding column:", error);
      toast.error("Failed to add column");
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!board) return;

    if (board.columns.length <= 1) {
      toast.error("Cannot delete the last column");
      return;
    }

    try {
      await deleteColumn({ boardId: board._id, columnId });
      toast.success("Column deleted");
      if (activeColumn === columnId) {
        setActiveColumn(null);
      }
      onBoardUpdate?.();
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Failed to delete column");
    }
  };

  const handleStartEditTitle = (columnId: string, currentTitle: string) => {
    setEditingColumnId(columnId);
    setEditingTitle(currentTitle);
  };

  const handleSaveTitle = async () => {
    if (!board || !editingColumnId) return;

    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await updateColumnTitle({
        boardId: board._id,
        columnId: editingColumnId,
        title: trimmedTitle,
      });
      setEditingColumnId(null);
      setEditingTitle("");
      onBoardUpdate?.();
    } catch (error) {
      console.error("Error updating column title:", error);
      toast.error("Failed to update title");
    }
  };

  const handleCancelEditTitle = () => {
    setEditingColumnId(null);
    setEditingTitle("");
  };

  const handleGenerateAllImages = async () => {
    if (!board) {
      toast.error("Please create a board first");
      return;
    }

    if (!boardPrompt.trim()) {
      toast.error("Please enter a routine description");
      return;
    }

    setIsGeneratingAll(true);

    try {
      const effectiveAvatarImageUrl = selectedStyle === "symbols" ? undefined : (avatarImageUrl ?? undefined);
      const result = await generateBoardImages(
        boardPrompt,
        selectedStyle,
        avatarPrompt,
        effectiveAvatarImageUrl
      );

      if (!result.success) {
        toast.error(result.error);

        if (result.partialImages && result.partialImages.length > 0) {
          const columnImages = await Promise.all(
            result.partialImages.map(async (img) => {
              const base64Response = await fetch(
                `data:image/png;base64,${img.imageData}`
              );
              const blob = await base64Response.blob();
              const uploadUrl = await generateUploadUrl();
              const uploadResponse = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": blob.type },
                body: blob,
              });
              const { storageId } = await uploadResponse.json();
              return {
                columnId: img.columnId,
                title: img.title,
                imageStorageId: storageId,
                imagePrompt: img.prompt,
              };
            })
          );

          await updateAllColumnImages({
            boardId: board._id,
            columnImages,
            generationPrompt: boardPrompt,
          });

          toast.info(`Saved ${result.partialImages.length} images before the error`);
          onBoardUpdate?.();
        }
        return;
      }

      const columnImages = await Promise.all(
        result.images.map(async (img) => {
          const base64Response = await fetch(
            `data:image/png;base64,${img.imageData}`
          );
          const blob = await base64Response.blob();
          const uploadUrl = await generateUploadUrl();
          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type },
            body: blob,
          });
          const { storageId } = await uploadResponse.json();
          return {
            columnId: img.columnId,
            title: img.title,
            imageStorageId: storageId,
            imagePrompt: img.prompt,
          };
        })
      );

      await updateAllColumnImages({
        boardId: board._id,
        columnImages,
        boardName: result.boardName,
        generationPrompt: boardPrompt,
      });

      posthog.capture("board_generated", {
        column_count: columnImages.length,
        style: selectedStyle,
      });
      toast.success("All images generated successfully!");
      setBoardPrompt("");
      onBoardUpdate?.();
    } catch (error) {
      posthog.captureException(error);
      console.error("Error generating all images:", error);
      toast.error("Failed to generate images");
    } finally {
      setIsGeneratingAll(false);
    }
  };

  if (!board) return null;

  const sortedColumns = [...board.columns].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-purple-700 mb-2">
          {board.name}
        </h2>
      </div>

      {!readOnly && !hasAvatar && (
        <div className="flex items-center justify-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Image Style:</span>
          <Select value={selectedStyle} onValueChange={handleStyleChange}>
            <SelectTrigger className="w-[200px]" data-testid="style-selector">
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

      {!readOnly && hasAvatar && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Using learner&apos;s avatar for consistent character appearance</span>
        </div>
      )}

      {!readOnly && (
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            placeholder='Describe the routine (e.g., "brushing teeth, eating breakfast, walking to school")'
            value={boardPrompt}
            onChange={(e) => setBoardPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && boardPrompt.trim() && !isGeneratingAll) {
                handleGenerateAllImages();
              }
            }}
            disabled={isGeneratingAll}
            className="flex-1"
            data-testid="batch-prompt-input"
          />
          <Button
            onClick={handleGenerateAllImages}
            disabled={!boardPrompt.trim() || isGeneratingAll}
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="batch-generate-button"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      )}

      <div className={`grid gap-4 ${getGridClasses(sortedColumns.length)}`}>
        {sortedColumns.map((column) => (
          <Card
            key={column.id}
            className={`relative transition-all duration-300 group ${
              !readOnly && "hover:shadow-lg"
            } ${
              activeColumn === column.id && !readOnly
                ? "ring-2 ring-purple-500 shadow-lg"
                : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                {!readOnly && editingColumnId === column.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle();
                        if (e.key === "Escape") handleCancelEditTitle();
                      }}
                      className="h-8 text-center"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-green-600"
                      onClick={handleSaveTitle}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={handleCancelEditTitle}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    {!readOnly && sortedColumns.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteColumn(column.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {!readOnly && sortedColumns.length <= 1 && (
                      <div className="w-7" />
                    )}
                    <CardTitle
                      className={`text-center text-xl font-semibold flex-1 ${
                        !readOnly ? "cursor-pointer hover:text-purple-600" : ""
                      }`}
                      onClick={(e) => {
                        if (!readOnly) {
                          e.stopPropagation();
                          handleStartEditTitle(column.id, column.title);
                        }
                      }}
                      data-testid="column-title"
                    >
                      {column.title}
                    </CardTitle>
                    {!readOnly ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditTitle(column.id, column.title);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="w-7" />
                    )}
                  </>
                )}
              </div>
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
                data-testid="column-image-area"
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
                      {!readOnly && (
                        <p className="text-sm text-gray-500">
                          Tap to add image
                        </p>
                      )}
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
                      data-testid="column-prompt-input"
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
                      data-testid="generate-image-button"
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
                        data-testid={`timer-button-${minutes}`}
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
          <Button variant="outline" onClick={handleAddColumn} data-testid="add-column-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
      )}
    </div>
  );
}
