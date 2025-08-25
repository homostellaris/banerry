import Script from "next/script";
import { PropsWithChildren } from "react";
import Navbar from "../_common/navbar";
import ElevenLabsWidget from "../_tts/elevenlabs-widget";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar basePath="/mentor" showHome />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        async
        type="text/javascript"
      ></Script>
      <ElevenLabsWidget
        agentId="agent_01k0qbvbr9fm0tmxc6a1szqs6k"
        baseUrl={"/mentor"}
      />
      {children}
    </>
  );
}
