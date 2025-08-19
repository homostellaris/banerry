"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ScriptCard from "./script-card";

export default function ReactiveScriptsList({
  preloadedLearnerWithScripts,
}: {
  preloadedLearnerWithScripts: Preloaded<typeof api.learners.getByPassphrase>;
}) {
  const learnerWithScripts = usePreloadedQuery(preloadedLearnerWithScripts);
  if (learnerWithScripts === null) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      {learnerWithScripts.scripts.map((script) => (
        <Link
          href={`/learner/${learnerWithScripts.passphrase}/script/${script._id}`}
          key={script._id}
          className="block"
        >
          <ScriptCard key={script._id} script={script} />
        </Link>
      ))}
    </div>
  );
}
