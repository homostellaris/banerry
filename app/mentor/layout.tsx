import { BookOpen, Calendar, Clock, Volume2 } from "lucide-react";
import Script from "next/script";
import { PropsWithChildren } from "react";
import Navbar from "../_common/navbar";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar basePath="/mentor" showHome />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        async
        type="text/javascript"
      ></Script>
      {/* @ts-expect-error: because I said so */}
      <elevenlabs-convai agent-id="agent_01k0qbvbr9fm0tmxc6a1szqs6k"></elevenlabs-convai>
      {children}
    </>
  );
}
