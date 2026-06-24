import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EkiSignal",
    short_name: "EkiSignal",
    description:
      "Citizen reporting and government accountability platform for Ekiti State, built for fast mobile reporting and transparent tracking.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    dir: "ltr",
    lang: "en-NG",
    background_color: "#f7f7f0",
    theme_color: "#0f5c43",
    categories: ["government", "utilities", "productivity"],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "Report issue",
        short_name: "Report",
        description: "Start a new report for roads, water, sanitation, and other public issues.",
        url: "/report/new",
      },
      {
        name: "Track report",
        short_name: "Track",
        description: "Open the tracking page and check a ticket status quickly.",
        url: "/track",
      },
      {
        name: "Area alerts",
        short_name: "Alerts",
        description: "See community notices and recent public alerts.",
        url: "/alerts",
      },
    ],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  }
}
