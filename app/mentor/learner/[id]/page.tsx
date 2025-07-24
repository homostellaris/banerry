import AddScriptForm from "@/app/_scripts/add-script-form";
import AddTargetScriptForm from "@/app/_scripts/add-target-script-form";
import MentorScriptsList from "@/app/_scripts/mentor-scripts-list";
import MentorTargetScriptsList from "@/app/_scripts/mentor-target-scripts-list";
import LearnerUrlDisplay from "@/app/learner/learner-url-display";
import DeleteLearnerButton from "@/app/mentor/delete-learner-button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadedQueryResult, preloadQuery } from "convex/nextjs";
import { notFound } from "next/navigation";

export default async function MentorLearnerPage({
  params,
}: {
  params: Promise<{ id: Id<"learners"> }>;
}) {
  const { id } = await params;

  const preloadedLearnerWithScripts = await preloadQuery(
    api.learners.getWithScripts,
    {
      learnerId: id,
    },
    {
      token: await convexAuthNextjsToken(),
    }
  );
  const learnerWithScripts = preloadedQueryResult(preloadedLearnerWithScripts);
  if (learnerWithScripts === null) notFound();

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <header>
        <h1 className="text-4xl font-bold text-purple-700">
          {learnerWithScripts.name}
        </h1>
        {learnerWithScripts.bio && (
          <p className="text-gray-600 max-w-2xl">{learnerWithScripts.bio}</p>
        )}
      </header>
      <div className="flex flex-wrap items-center gap-2">
        {/* <ShareLearnerForm /> */}
        <AddScriptForm learnerId={id as Id<"learners">} />
        <AddTargetScriptForm learnerId={id as Id<"learners">} />
        <DeleteLearnerButton
          learnerId={id as Id<"learners">}
          learnerName={learnerWithScripts.name}
        />
      </div>

      <LearnerUrlDisplay
        name={learnerWithScripts.name}
        passphrase={learnerWithScripts.passphrase}
      />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-orange-700 flex items-center gap-2">
          🎯 Target Scripts
          <span className="text-sm font-normal text-gray-600">
            ({learnerWithScripts.targetScripts.length}/3)
          </span>
        </h2>
        {learnerWithScripts.targetScripts.length > 0 ? (
          <MentorTargetScriptsList
            preloadedLearnerWithScripts={preloadedLearnerWithScripts}
          />
        ) : (
          <p className="text-gray-600 italic">
            No target scripts yet. Add up to 3 scripts that you want the learner
            to work towards.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-purple-700">📝 All Scripts</h2>
        <MentorScriptsList
          preloadedLearnerWithScripts={preloadedLearnerWithScripts}
        />
      </div>
    </div>
  );
}
