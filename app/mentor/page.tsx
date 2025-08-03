import AddLearnerForm from "@/app/mentor/add-learner-form";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import Learners from "./learners";

export default async function MentorPage() {
  const preloadedLearners = await preloadQuery(
    api.learners.list,
    {},
    {
      token: await convexAuthNextjsToken(),
    }
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Learners</h1>
        <AddLearnerForm />
      </div>
      <Learners preloadedLearners={preloadedLearners} />
    </div>
  );
}
