import MitigationsLoading from "@/app/components/mitigations-loading";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MitigationsSection } from "./mitigation-section";

export default async function ScriptPage({
  params,
}: {
  params: Promise<{ id: Id<"scripts"> }>;
}) {
  const { id } = await params;
  const script = await fetchQuery(api.scripts.get, { id });
  if (script === null) notFound();

  return (
    <Suspense fallback={<MitigationsLoading />}>
      <MitigationsSection scriptText={script.dialogue} />
    </Suspense>
  );
}
