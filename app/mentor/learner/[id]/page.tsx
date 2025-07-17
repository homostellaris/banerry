"use client";

import React, { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import MentorScriptTabs from "@/app/components/mentor-script-tabs";
import AddScriptForm from "@/app/components/add-script-form";
import DeleteLearnerButton from "@/app/components/delete-learner-button";
import LearnerUrlDisplay from "@/app/components/learner-url-display";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MentorLearnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const learner = useQuery(api.learners.get, {
    learnerId: id as Id<"learners">,
  });
  const scripts = useQuery(api.scripts.list, {
    learnerId: id as Id<"learners">,
  });

  if (learner === undefined || scripts === undefined) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (learner === null) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Learner not found</div>
          <Link href="/mentor">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learners
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
          <DeleteLearnerButton
            learnerId={id as Id<"learners">}
            learnerName={learner.name}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-purple-700 mb-2">
              {learner.name}'s Scripts
            </h1>
            {learner.bio && (
              <p className="text-gray-600 max-w-2xl">{learner.bio}</p>
            )}
          </div>
          <AddScriptForm learnerId={id as Id<"learners">} />
        </div>
      </header>

      <div className="mb-6">
        <LearnerUrlDisplay
          name={learner.name}
          passphrase={learner.passphrase}
        />
      </div>

      <MentorScriptTabs scripts={scripts} />
    </div>
  );
}
