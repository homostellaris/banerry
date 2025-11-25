import DeleteLearnerButton from "@/app/mentor/_components/delete-learner-button";
import LearnerUrlDisplay from "@/app/mentor/_components/learner-url-display";
import MentorsList from "@/app/mentor/_components/mentors-list";
import ShareLearnerForm from "@/app/mentor/_components/share-learner-form";
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
        <ShareLearnerForm
          learnerId={id as Id<"learners">}
          learnerName={learnerWithScripts.name}
        />
        <DeleteLearnerButton
          learnerId={id as Id<"learners">}
          learnerName={learnerWithScripts.name}
        />
      </div>

      <LearnerUrlDisplay passphrase={learnerWithScripts.passphrase} />

      <div className="space-y-4">
        <MentorsList learnerId={id as Id<"learners">} />
      </div>
    </div>
  );
}
