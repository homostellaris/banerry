"use client";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { MoreVertical, Edit3, Trash2, CheckCircle } from "lucide-react";
import DeleteTargetScriptButton from "./delete-target-script-button";
import EditTargetScriptDialog from "./edit-target-script-dialog";
import MarkAsLearnedButton from "./mark-as-learned-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";

export function Dropdown({
  targetScript,
}: {
  targetScript: Doc<"targetScripts">;
}) {
  const [dialog, setDialog] = useState<"edit" | "delete" | "markAsLearned" | null>();

  return (
    <Dialog
      open={!!dialog}
      onOpenChange={(open) => setDialog(open ? dialog : null)}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="ml-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setDialog("markAsLearned");
            }}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as learned
          </DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                // e.stopPropagation();
                setDialog("edit");
              }}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              setDialog("delete");
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog === "edit" && (
        <EditTargetScriptDialog
          state={[dialog === "edit", () => setDialog(undefined)]}
          targetScript={targetScript}
        />
      )}
      <MarkAsLearnedButton
        dialogue={targetScript.dialogue}
        state={[dialog === "markAsLearned", () => setDialog(undefined)]}
        targetScriptId={targetScript._id}
      />
      <DeleteTargetScriptButton
        dialogue={targetScript.dialogue}
        state={[dialog === "delete", () => setDialog(undefined)]}
        targetScriptId={targetScript._id}
      />
    </Dialog>
  );
}
