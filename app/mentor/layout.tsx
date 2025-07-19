import type React from "react";
import Script from "next/script";
import { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { SignOutButton } from "./signout-button";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-700">Banerry</h1>
        <SignOutButton />
      </header>
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        async
        type="text/javascript"
      ></Script>
      {/* @ts-ignore */}
      <elevenlabs-convai agent-id="agent_01jxr34ba0esfs9gp69ar7b3vq"></elevenlabs-convai>
      {children}
    </>
  );
}
