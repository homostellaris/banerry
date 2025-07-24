import Navbar from "@/app/_common/navbar";
import { BookOpen, Calendar, Clock, Volume2 } from "lucide-react";
import Script from "next/script";
import { PropsWithChildren } from "react";

export default async function LearnerPassphraseLayout({
  children,
  params,
}: PropsWithChildren<{
  params: Promise<{ passphrase: string }>;
}>) {
  const { passphrase } = await params;

  return (
    <>
      <Navbar basePath={`/learner/${passphrase}`} />
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
