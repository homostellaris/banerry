"use client";

import ScriptTabs from "@/app/components/script-tabs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { use } from "react";

export default function LearnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const learnerWithScripts = useQuery(api.learners.getLearnerByPassphrase, {
    passphrase: id,
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">My Scripts</h1>
      </header>

      <ScriptTabs scripts={learnerWithScripts?.scripts || []} />
    </div>
  );
}
