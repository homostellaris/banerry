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
import { useState } from "react";
import { toast } from "sonner";

interface MarkAsLearnedButtonProps {
  dialogue: string;
  state: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  targetScriptId: Id<"targetScripts">;
}

export default function MarkAsLearnedButton({
  dialogue,
  state,
  targetScriptId,
}: MarkAsLearnedButtonProps) {
  const [isMarking, setIsMarking] = useState(false);
  const markAsLearned = useMutation(api.targetScripts.markAsLearned);

  const handleMarkAsLearned = async () => {
    try {
      setIsMarking(true);
      await markAsLearned({ id: targetScriptId });
      toast.success("Target script marked as learned!");
    } catch (error) {
      console.error("Error marking target script as learned:", error);
      toast.error("Failed to mark target script as learned");
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <AlertDialog open={state[0]} onOpenChange={state[1]}>
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.body.style.pointerEvents = "";
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Mark as Learned</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to mark the target script &quot;{dialogue}
            &quot; as learned? This will move it to your regular scripts and
            free up a target script slot.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleMarkAsLearned} disabled={isMarking}>
            {isMarking ? "Marking..." : "Mark as Learned"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
