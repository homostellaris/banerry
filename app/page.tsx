"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import PWAInstall from "./_common/pwa-install";

export default function HomePage() {
  return (
    <>
      <main>
        <div className="flex flex-col min-h-screen items-center justify-center p-6 text-center">
          <h1 className="text-5xl font-bold text-purple-700 mb-6">Banerry</h1>
          <p className="text-2xl text-gray-600 max-w-2xl mb-10">
            Communication assistance for gestalt language processors
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
