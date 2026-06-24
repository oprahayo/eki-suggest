import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Sora } from "next/font/google"
import "leaflet/dist/leaflet.css"
import "./globals.css"

import { AppProviders } from "@/components/providers/app-providers"

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://ekisignal.local"),
  title: {
    default: "EkiSignal",
    template: "%s | EkiSignal",
  },
  description:
    "EkiSignal is a production-style civic reporting and accountability platform for Ekiti State with citizen, admin, and handler workflows.",
  applicationName: "EkiSignal",
  appleWebApp: {
    capable: true,
    title: "EkiSignal",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#0f5c43",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} ${sora.variable} light`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-screen font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
