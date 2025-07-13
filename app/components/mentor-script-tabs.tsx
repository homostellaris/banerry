"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScriptCard from "./script-card";
import { Id } from "@/convex/_generated/dataModel";

interface DatabaseScript {
  _id: Id<"scripts">;
  _creationTime: number;
  dialogue: string;
  parentheticals: string;
}

interface MentorScriptTabsProps {
  scripts: DatabaseScript[];
  learnerId: string;
}

export default function MentorScriptTabs({ scripts, learnerId }: MentorScriptTabsProps) {
  // Convert database scripts to the format expected by ScriptCard
  const formattedScripts = scripts.map((script) => ({
    id: script._id,
    text: script.dialogue,
  }));

  // Filter recent scripts (created in the last 7 days)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentScripts = formattedScripts.filter((_, index) => 
    scripts[index]._creationTime > oneWeekAgo
  );

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-17 mb-6">
        <TabsTrigger value="all" className="text-xl py-4">
          All Scripts ({formattedScripts.length})
        </TabsTrigger>
        <TabsTrigger value="recent" className="text-xl py-4">
          Recent Scripts ({recentScripts.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <div className="grid gap-6">
          {formattedScripts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No scripts yet</div>
              <p className="text-sm text-gray-400">Add your first script to get started</p>
            </div>
          ) : (
            formattedScripts.map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="recent">
        <div className="grid gap-6">
          {recentScripts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No recent scripts</div>
              <p className="text-sm text-gray-400">Scripts created in the last 7 days will appear here</p>
            </div>
          ) : (
            recentScripts.map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}