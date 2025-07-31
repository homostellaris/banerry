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
  dialogue: string;
  state: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  targetScriptId: Id<"targetScripts">;
}

export default function DeleteTargetScriptButton({
  dialogue,
  state,
  targetScriptId,
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Target Script</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the target script &quot;{dialogue}
            &quot;? This action cannot be undone.
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
