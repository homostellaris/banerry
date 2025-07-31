import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doc } from "@/convex/_generated/dataModel";
import { Edit3, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import AudioButton from "../_tts/audio-button";
import DeleteTargetScriptButton from "./delete-target-script-button";
import EditTargetScriptDialog from "./edit-target-script-dialog";

export default function TargetScriptCard({
  targetScript,
  showDeleteButton = false,
  showEditButton = false,
}: {
  targetScript: Doc<"targetScripts">;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
}) {
  const [dialog, setDialog] = useState<"edit" | "delete" | null>();

  return (
    <Card className="h-full overflow-hidden border-2 border-orange-200 bg-orange-50 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="h-full p-6">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-800 pr-4">
              {targetScript.dialogue}
            </p>
          </div>
          <div className="flex items-center">
            <AudioButton text={targetScript.dialogue} />
            {(showEditButton || showDeleteButton) && (
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
                    {showEditButton && (
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            setDialog("edit");
                          }}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DialogTrigger>
                    )}
                    {showDeleteButton && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          setDialog("delete");
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
