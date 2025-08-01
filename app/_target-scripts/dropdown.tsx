"use client";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { MoreVertical, Edit3, Trash2 } from "lucide-react";
import DeleteTargetScriptButton from "./delete-target-script-button";
import EditTargetScriptDialog from "./edit-target-script-dialog";
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
  const [dialog, setDialog] = useState<"edit" | "delete" | null>();

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
      <DeleteTargetScriptButton
        dialogue={targetScript.dialogue}
        state={[dialog === "delete", () => setDialog(undefined)]}
        targetScriptId={targetScript._id}
      />
    </Dialog>
  );
}
