"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScriptCard from "./script-card";

interface Script {
  id: string;
  text: string;
  meanings: {
    id: string;
    text: string;
    context: string;
  }[];
  dateAdded: string;
}

interface ScriptTabsProps {
  scripts: Script[];
}

export default function ScriptTabs({ scripts }: ScriptTabsProps) {
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
          {scripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="recent">
        <div className="grid gap-6">
          {scripts
            .sort(
              (a, b) =>
                new Date(b.dateAdded).getTime() -
                new Date(a.dateAdded).getTime()
            )
            .slice(0, 3)
            .map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
