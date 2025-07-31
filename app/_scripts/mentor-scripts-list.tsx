"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import ScriptCard from "./script-card";

export default function MentorScriptsList({
  preloadedLearnerWithScripts,
}: {
  preloadedLearnerWithScripts: Preloaded<typeof api.learners.getWithScripts>;
}) {
  const learnerWithScripts = usePreloadedQuery(preloadedLearnerWithScripts);
  const router = useRouter();
  
  if (learnerWithScripts === null) {
    notFound();
  }

  const handleScriptClick = (scriptId: string, event: React.MouseEvent) => {
    // Check if the click target is the delete button or its children
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      event.stopPropagation();
      return;
    }
    
    // Navigate to learner script page
    router.push(`/learner/${learnerWithScripts.passphrase}/script/${scriptId}`);
  };

  return (
    <div className="grid gap-6">
      {learnerWithScripts.scripts.map((script) => (
        <div 
          key={script._id}
          onClick={(e) => handleScriptClick(script._id, e)}
          className="block cursor-pointer"
        >
          <ScriptCard 
            script={script} 
            showDeleteButton={true}
            showEditButton={true}
          />
        </div>
      ))}
    </div>
  );
}