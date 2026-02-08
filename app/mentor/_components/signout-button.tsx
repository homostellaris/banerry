"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated } from "convex/react";
import posthog from "posthog-js";

export function SignOutButton() {
  const { signOut } = useAuthActions();

  const handleSignOut = () => {
    posthog.capture("sign_out_clicked");
    localStorage.removeItem("posthog_consent");
    posthog.reset();
    void signOut();
  };

  return (
    <Authenticated>
      <button
        className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-full px-3 py-1 text-sm"
        onClick={handleSignOut}
      >
        Sign out
      </button>
    </Authenticated>
  );
}
