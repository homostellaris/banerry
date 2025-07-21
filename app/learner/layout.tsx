import type React from "react";
import Script from "next/script";
import { PropsWithChildren } from "react";
import { Home } from "lucide-react";
import { SignOutButton } from "../mentor/signout-button";
import Link from "next/link";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        {/* <h1 className="text-2xl font-bold text-purple-700">Banerry</h1> */}
        <Link href="/mentor">
          <Home className="h-6 w-6 text-purple-700" />
        </Link>
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
