"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import { CitizenMenuSheet } from "@/components/citizen/citizen-menu-sheet"
import { BottomNav } from "@/components/citizen/home/bottom-nav"
import { FloatingTopBar } from "@/components/citizen/home/floating-top-bar"
import { ConnectivityIndicator } from "@/components/pwa/connectivity-indicator"
import { LaunchSplash } from "@/components/pwa/launch-splash"
import { usePwa } from "@/hooks/use-pwa"
import { useReportCenter } from "@/hooks/use-report-center"
import { cn } from "@/lib/utils"

export function CitizenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isStandalone, showLaunchSplash } = usePwa()
  const { selectedArea, requestDeviceLocation } = useReportCenter()
  const [menuOpen, setMenuOpen] = useState(false)
  const isHome = pathname === "/"
  const contentClassName = useMemo(
    () =>
      cn(
        "relative min-h-screen pb-[calc(8.25rem+env(safe-area-inset-bottom))] sm:pb-[7.75rem]",
        isHome ? "" : "pt-[calc(6.85rem+env(safe-area-inset-top))]"
      ),
    [isHome]
  )

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,173,69,0.16),transparent_32%),radial-gradient(circle_at_80%_22%,rgba(15,92,67,0.12),transparent_26%),linear-gradient(180deg,#f8f7f2,rgba(244,247,241,0.98))]" />
      <ConnectivityIndicator />
      <div
        className="fixed inset-x-0 top-0 mx-auto w-full max-w-7xl"
        style={{ zIndex: 1100 }}
      >
        <FloatingTopBar
          areaLabel={selectedArea}
          onOpenMenu={() => setMenuOpen(true)}
          onRequestLocation={async () => {
            const result = await requestDeviceLocation({
              fallbackLabel: selectedArea,
            })

            if (result.status === "granted") {
              toast.success("Live location saved. The Ekiti map has been centered for you.")
              return
            }

            if (result.status === "denied") {
              toast.message("Location stayed manual. You can update it later from Settings.")
              return
            }

            toast.message("Device location is unavailable. EkiSignal is using your saved area instead.")
          }}
        />
      </div>
      <main className={contentClassName} data-standalone={isStandalone ? "true" : "false"}>
        {children}
      </main>
      <CitizenMenuSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        areaLabel={selectedArea}
      />
      <BottomNav />
      <LaunchSplash open={showLaunchSplash} />
    </div>
  )
}
