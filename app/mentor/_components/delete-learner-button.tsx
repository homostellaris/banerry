"use client";

import type React from "react";
import { useState } from "react";
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
import { Trash2, Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

interface DeleteLearnerButtonProps {
  learnerId: Id<"learners">;
  learnerName: string;
}

export default function DeleteLearnerButton({
  learnerId,
  learnerName,
}: DeleteLearnerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const deleteLearner = useMutation(api.learners.del);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLearner({ learnerId });
      posthog.capture("learner_deleted");
      router.push("/mentor");
    } catch (error) {
      posthog.captureException(error);
      console.error("Failed to delete learner:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Learner
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Learner</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{learnerName}</strong>? This
            action cannot be undone and will permanently remove:
            <br />
            <br />
            • All scripts associated with this learner • All mitigations and
            contexts • All learner links and relationships
            <br />
            <br />
            This action is permanent and cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
