import Navbar from "@/app/_common/navbar";
import ElevenLabsWidget from "@/app/_tts/elevenlabs-widget";
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
      <ElevenLabsWidget
        agentId="agent_01jxr34ba0esfs9gp69ar7b3vq"
        baseUrl={`/learner/${passphrase}`}
      />
      {children}
    </>
  );
}
