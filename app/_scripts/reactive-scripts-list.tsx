"use client";

import { Doc } from "@/convex/_generated/dataModel";
import ScriptCard from "./script-card";
import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { notFound, usePathname } from "next/navigation";
import Link from "next/link";

export default function ReactiveScriptsList({
  preloadedLearnerWithScripts,
}: {
  preloadedLearnerWithScripts: Preloaded<typeof api.learners.getWithScripts>;
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
