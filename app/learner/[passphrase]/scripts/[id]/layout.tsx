import ScriptCard from "@/app/_scripts/script-card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type React from "react";

export default async function ScriptLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ passphrase: string; id: string }>;
}) {
  const { passphrase, id } = await params;
  const script = await fetchQuery(api.scripts.get, { id: id as Id<"scripts"> });
  if (script === null) notFound();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link
        href={`/learner/${passphrase}`}
        className="inline-flex items-center text-xl text-purple-600 mb-6"
      >
        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Scripts
      </Link>

      <header className="mb-8 text-center">
        <ScriptCard script={script} />
      </header>
      <main className="min-h-[400px]">{children}</main>
    </div>
  );
}
