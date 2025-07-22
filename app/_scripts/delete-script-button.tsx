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

interface DeleteScriptButtonProps {
  scriptId: Id<"scripts">;
  dialogue: string;
}

export default function DeleteScriptButton({
  scriptId,
  dialogue,
}: DeleteScriptButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteScript = useMutation(api.scripts.remove);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteScript({ id: scriptId });
      toast.success("Script deleted successfully");
    } catch (error) {
      console.error("Error deleting script:", error);
      toast.error("Failed to delete script");
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
          <AlertDialogTitle>Delete Script</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the script? This action cannot be
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
