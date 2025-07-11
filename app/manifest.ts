import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Banerry",
    short_name: "Banerry",
    description:
      "Speech and transition assistance for gestalt language processors.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    orientation: "portrait-primary",
    categories: ["education", "productivity", "utilities"],
    lang: "en",
    dir: "ltr",
    scope: "/",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    // screenshots: [
    //   {
    //     src: "/screenshot-wide.png",
    //     sizes: "1280x720",
    //     type: "image/png",
    //     form_factor: "wide",
    //     label: "Banerry - Desktop View",
    //   },
    //   {
    //     src: "/screenshot-narrow.png",
    //     sizes: "750x1334",
    //     type: "image/png",
    //     form_factor: "narrow",
    //     label: "Banerry - Mobile View",
    //   },
    // ],
    shortcuts: [
      {
        name: "View Scripts",
        short_name: "Scripts",
        description: "View all learner scripts",
        url: "/learner/1",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
