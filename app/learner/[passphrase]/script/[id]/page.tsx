"use client";

import MitigationsLoading from "@/app/components/mitigations-loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { AlertCircle } from "lucide-react";
import { Suspense, use } from "react";
import { MitigationsSection } from "./mitigation-section";

export default function ScriptPage({
  params,
}: {
  params: Promise<{ id: Id<"scripts"> }>;
}) {
  const { id } = use(params);
  const script = useQuery(api.scripts.get, { id });

  if (!script) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Script not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <Suspense fallback={<MitigationsLoading />}>
      <MitigationsSection scriptText={script.dialogue} />
    </Suspense>
  );
}
