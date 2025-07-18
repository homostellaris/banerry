import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LearnerCard from "@/app/learner/learner-card";
import AddLearnerForm from "@/app/mentor/add-learner-form";
import { fetchQuery } from "convex/nextjs";

export default async function MentorPage() {
  const learners = await fetchQuery(api.learners.list);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Learners</h1>
        <AddLearnerForm />
      </div>

      {learners.length === 0 ? (
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
      )}
    </div>
  );
}
