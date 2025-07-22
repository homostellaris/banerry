import AddScriptForm from "@/app/_scripts/add-script-form";
import MentorScriptsList from "@/app/_scripts/mentor-scripts-list";
import LearnerUrlDisplay from "@/app/learner/learner-url-display";
import DeleteLearnerButton from "@/app/mentor/delete-learner-button";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadedQueryResult, preloadQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareLearnerForm from "../../share-learner-form";

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
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/mentor">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learners
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <DeleteLearnerButton
              learnerId={id as Id<"learners">}
              learnerName={learnerWithScripts.name}
            />
            {/* <ShareLearnerForm /> */}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-4xl font-bold text-purple-700 mb-2">
              {learnerWithScripts.name}
            </h1>
            {learnerWithScripts.bio && (
              <p className="text-gray-600 max-w-2xl">
                {learnerWithScripts.bio}
              </p>
            )}
          </div>
          <AddScriptForm learnerId={id as Id<"learners">} />
        </div>
      </header>

      <div className="mb-6">
        <LearnerUrlDisplay
          name={learnerWithScripts.name}
          passphrase={learnerWithScripts.passphrase}
        />
      </div>

      <MentorScriptsList
        preloadedLearnerWithScripts={preloadedLearnerWithScripts}
      />
    </div>
  );
}
