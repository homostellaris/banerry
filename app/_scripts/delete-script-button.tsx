"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import posthog from "posthog-js";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

interface DeleteScriptButtonProps {
  scriptId: Id<"scripts">;
  state: [boolean, Dispatch<SetStateAction<boolean>>];
  children?: React.ReactNode;
}

export default function DeleteScriptButton({
  scriptId,
  state,
}: DeleteScriptButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteScript = useMutation(api.scripts.remove);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteScript({ id: scriptId });
      posthog.capture("script_deleted");
      toast.success("Script deleted successfully");
    } catch (error) {
      posthog.captureException(error);
      console.error("Error deleting script:", error);
      toast.error("Failed to delete script");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={state[0]} onOpenChange={state[1]}>
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
