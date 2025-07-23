"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { notFound } from "next/navigation";
import TargetScriptCard from "./target-script-card";

export default function MentorTargetScriptsList({
  preloadedLearnerWithScripts,
}: {
  preloadedLearnerWithScripts: Preloaded<typeof api.learners.getWithScripts>;
}) {
  const learnerWithScripts = usePreloadedQuery(preloadedLearnerWithScripts);
  
  if (learnerWithScripts === null) {
    notFound();
  }

  const handleTargetScriptClick = (_targetScriptId: string, event: React.MouseEvent) => {
    // Check if the click target is the delete button or its children
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      event.stopPropagation();
      return;
    }
    
    // Navigate to learner target script page (if needed in the future)
    // router.push(`/learner/${learnerWithScripts.passphrase}/target-script/${targetScriptId}`);
  };

  return (
    <div className="grid gap-6">
      {learnerWithScripts.targetScripts.map((targetScript) => (
        <div 
          key={targetScript._id}
          onClick={(e) => handleTargetScriptClick(targetScript._id, e)}
          className="block cursor-pointer"
        >
          <TargetScriptCard 
            targetScript={targetScript} 
            showDeleteButton={true}
          />
        </div>
      ))}
    </div>
  );
}