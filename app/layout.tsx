import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { VoiceProvider } from "@/app/contexts/voice-context";
import Script from "next/script";
import type { Metadata, Viewport } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Banerry",
    template: "%s | Banerry",
  },
  description:
    "A tool to help people who are gestalt language processors develop their speech",
  keywords: [
    "PWA",
    "Gestalt Language Processing",
    "Language Development",
    "Communication",
  ],
  authors: [{ name: "Banerry Team" }],
  creator: "Banerry",
  publisher: "Banerry",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://banerry.vercel.app"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://banerry.vercel.app",
    title: "Banerry",
    description:
      "A tool to help people who are gestalt language processors develop their speech",
    siteName: "Banerry",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Banerry - Helping gestalt language processors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Banerry",
    description:
      "A tool to help people who are gestalt language processors develop their speech",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Banerry",
    startupImage: [
      "/apple-touch-startup-image-768x1004.png",
      {
        url: "/apple-touch-startup-image-1536x2008.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#7c3aed",
    "msapplication-config": "/browserconfig.xml",
  },
  generator: "v0.dev",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#7c3aed" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#7c3aed" />
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
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <VoiceProvider>
                {children}
                {/* <SettingsMenu /> */}
              </VoiceProvider>
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
