import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { use } from "react";

export default function ScriptLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ passphrase: string }>;
}) {
  const { passphrase } = use(params);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link
        href={`/learner/${passphrase}`}
        className="inline-flex items-center text-xl text-purple-600 mb-6"
      >
        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Scripts
      </Link>

      <main className="min-h-[400px]">{children}</main>
    </div>
  );
}
