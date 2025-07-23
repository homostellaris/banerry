"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteTargetScriptButtonProps {
  targetScriptId: Id<"targetScripts">;
  dialogue: string;
}

export default function DeleteTargetScriptButton({
  targetScriptId,
  dialogue,
}: DeleteTargetScriptButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTargetScript = useMutation(api.targetScripts.remove);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTargetScript({ id: targetScriptId });
      toast.success("Target script deleted successfully");
    } catch (error) {
      console.error("Error deleting target script:", error);
      toast.error("Failed to delete target script");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDeleting}
          className="ml-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Target Script</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the target script &quot;{dialogue}&quot;? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}