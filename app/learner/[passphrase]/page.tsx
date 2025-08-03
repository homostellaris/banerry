import ReactiveScriptsList from "@/app/_scripts/reactive-scripts-list";
import ReactiveTargetScriptsList from "@/app/_target-scripts/reactive-target-scripts-list";
import QuickWords from "@/app/_common/quick-words";
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
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">My Scripts</h1>
      </header>

      <QuickWords />

      {learnerWithScripts?.targetScripts &&
        learnerWithScripts.targetScripts.length > 0 && (
          <ReactiveTargetScriptsList
            preloadedLearnerWithScripts={preloadedLearnerWithScripts}
          />
        )}

      <ReactiveScriptsList
        preloadedLearnerWithScripts={preloadedLearnerWithScripts}
      />
    </div>
  );
}
