"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import LearnerCard from "./learner-card";

export default function Learners({
  preloadedLearners,
}: {
  preloadedLearners: Preloaded<typeof api.learners.list>;
}) {
  const learners = usePreloadedQuery(preloadedLearners);
  return learners.length === 0 ? (
    <div className="text-center py-12">
      <div className="text-gray-500 mb-4">No learners yet</div>
      <p className="text-sm text-gray-400">
        Add your first learner to get started
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {learners.map((learner) => (
        <LearnerCard key={learner._id} learner={learner} />
      ))}
    </div>
  );
}
