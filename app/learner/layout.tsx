import Script from "next/script";
import { PropsWithChildren } from "react";
import Navbar from "./navbar";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar />
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
