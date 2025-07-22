import { Card, CardContent } from "@/components/ui/card";
import { Doc } from "@/convex/_generated/dataModel";
import AudioButton from "../_tts/audio-button";
import DeleteScriptButton from "./delete-script-button";

export default function ScriptCard({
  script,
  showDeleteButton = false,
}: {
  script: Doc<"scripts">;
  showDeleteButton?: boolean;
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
            {showDeleteButton && (
              <DeleteScriptButton
                scriptId={script._id}
                dialogue={script.dialogue}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
