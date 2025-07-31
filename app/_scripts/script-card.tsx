import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Doc } from "@/convex/_generated/dataModel";
import { Edit3, MoreVertical, Trash2 } from "lucide-react";
import AudioButton from "../_tts/audio-button";
import DeleteScriptButton from "./delete-script-button";
import EditScriptDialog from "./edit-script-dialog";

export default function ScriptCard({
  script,
  showDeleteButton = false,
  showEditButton = false,
}: {
  script: Doc<"scripts">;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
}) {
  return (
    <Card className="overflow-hidden border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800 pr-4">
            {script.dialogue}
          </h3>
          <div className="flex items-center">
            <AudioButton text={script.dialogue} />
            {(showEditButton || showDeleteButton) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {showEditButton && (
                    <EditScriptDialog script={script}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </EditScriptDialog>
                  )}
                  {showDeleteButton && (
                    <DeleteScriptButton
                      scriptId={script._id}
                      dialogue={script.dialogue}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DeleteScriptButton>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
