import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { VoiceProvider } from "@/app/contexts/voice-context";
import SettingsMenu from "@/app/components/settings-menu";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gestalt Speech Therapy",
  description:
    "A tool to help gestalt language processors develop their speech",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://unpkg.com/@elevenlabs/convai-widget-embed"
          async
          type="text/javascript"
        ></Script>
      </head>
      <body className={inter.className}>
        {/* @ts-ignore */}
        <elevenlabs-convai agent-id="agent_01jxr34ba0esfs9gp69ar7b3vq"></elevenlabs-convai>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <VoiceProvider>
            {children}
            <SettingsMenu />
          </VoiceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
