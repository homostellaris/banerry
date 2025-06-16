import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ScriptTabs from "@/app/components/script-tabs";
import { scripts } from "@/app/data/scripts";

export default function LearnerPage({ params }: { params: { id: string } }) {
  const learnerId = params.id;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">My Scripts</h1>
        <p className="text-xl text-gray-600">
          These are the phrases I use to communicate
        </p>
      </header>

      <ScriptTabs scripts={scripts} />
    </div>
  );
}
