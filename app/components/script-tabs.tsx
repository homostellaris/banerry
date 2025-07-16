"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Doc } from "@/convex/_generated/dataModel";
import ScriptCard from "./script-card";

export default function ScriptTabs({ scripts }: { scripts: Doc<"scripts">[] }) {
  console.log("ScriptTabs scripts:", scripts);
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-17 mb-6">
        <TabsTrigger value="all" className="text-xl py-4">
          All Scripts
        </TabsTrigger>
        <TabsTrigger value="recent" className="text-xl py-4">
          Recent Scripts
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <div className="grid gap-6">
          {scripts.length > 0 ? (
            scripts.map((script) => (
              <ScriptCard key={script._id} script={script} />
            ))
          ) : (
            <p>No scripts available</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="recent">
        <div className="grid gap-6">
          {scripts.length > 0 ? (
            scripts.map((script) => (
              <ScriptCard key={script._id} script={script} />
            ))
          ) : (
            <p>No scripts available</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
