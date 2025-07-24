"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated } from "convex/react";

export function SignOutButton() {
  const { signOut } = useAuthActions();
  return (
    <Authenticated>
      <button
        className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-md px-2 py-1"
        onClick={() => void signOut()}
      >
        Sign out
      </button>
    </Authenticated>
  );
}
