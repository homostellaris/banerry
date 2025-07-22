"use client";

import { Authenticated } from "convex/react";
import { Home } from "lucide-react";
import { SignOutButton } from "../mentor/signout-button";
import Link from "next/link";

export default function Navbar() {
  return (
    <Authenticated>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        {/* <h1 className="text-2xl font-bold text-purple-700">Banerry</h1> */}
        <Link href="/mentor">
          <Home className="h-6 w-6 text-purple-700" />
        </Link>
        <SignOutButton />
      </header>
    </Authenticated>
  );
}
