import LearnerCard from "@/app/learner/learner-card";
import AddLearnerForm from "@/app/mentor/add-learner-form";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import Learners from "./learners";
import ShareLearnerForm from "./share-learner-form";

export default async function MentorPage() {
  const preloadedLearners = await preloadQuery(
    api.learners.list,
    {},
    {
      token: await convexAuthNextjsToken(),
    }
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Learners</h1>
        <AddLearnerForm />
      </div>
      <Learners preloadedLearners={preloadedLearners} />
    </div>
  );
}
