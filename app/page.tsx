"use client";

import { Button } from "@/components/ui/button";
import PWAInstall from "./_common/pwa-install";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  return (
    <>
      <main>
        <div className="flex flex-col min-h-screen items-center justify-center p-6 text-center pr-20">
          <h1 className="text-5xl font-bold text-purple-700 mb-6">Banerry</h1>
          <p className="text-2xl text-gray-600 max-w-2xl mb-10">
            Speech and transition assistance for gestalt language processors.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <Link href="/mentor">
                <Button className="text-xl py-6 px-8 w-full max-w-md">
                  Mentor
                </Button>
              </Link>
              <Link href="/learner">
                <Button
                  className="text-xl py-6 px-8 w-full max-w-md bg-transparent"
                  variant="outline"
                >
                  Learner
                </Button>
              </Link>
            </div>
          </div>

          <PWAInstall />
        </div>
      </main>
    </>
  );
}
