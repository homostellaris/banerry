import ReactiveScriptsList from "@/app/_scripts/reactive-scripts-list";
import ReactiveTargetScriptsList from "@/app/_scripts/reactive-target-scripts-list";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { preloadQuery } from "convex/nextjs";
import { preloadedQueryResult } from "convex/nextjs";

export default async function LearnerPage({
  params,
}: {
  params: Promise<{ passphrase: string }>;
}) {
  const { passphrase } = await params;
  const preloadedLearnerWithScripts = await preloadQuery(
    api.learners.getByPassphrase,
    {
      passphrase,
    }
  );

  const learnerWithScripts = preloadedQueryResult(preloadedLearnerWithScripts);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">My Scripts</h1>
      </header>

      {learnerWithScripts?.targetScripts &&
        learnerWithScripts.targetScripts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-orange-700 mb-4 flex items-center gap-2">
              🎯 Target Scripts
            </h2>
            <ReactiveTargetScriptsList
              preloadedLearnerWithScripts={preloadedLearnerWithScripts}
            />
          </div>
        )}

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
          <ReactiveScriptsList
            preloadedLearnerWithScripts={preloadedLearnerWithScripts}
          />
        </TabsContent>

        <TabsContent value="recent">
          {/* <div className="grid gap-6">
            {scripts.length > 0 ? (
              scripts.map((script) => (
                <ScriptCard key={script._id} script={script} />
              ))
            ) : (
              <p>No scripts available</p>
            )}
          </div> */}
          <p>Coming soon...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
