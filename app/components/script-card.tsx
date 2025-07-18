import { Card, CardContent } from "@/components/ui/card";
import { Doc } from "@/convex/_generated/dataModel";
import AudioButton from "./audio-button";

export default function ScriptCard({ script }: { script: Doc<"scripts"> }) {
  return (
    <Card className="overflow-hidden border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800 pr-4">
            {script.dialogue}
          </h3>
          <AudioButton text={script.dialogue} />
        </div>
      </CardContent>
    </Card>
  );
}
