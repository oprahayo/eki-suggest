"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import { motion } from "framer-motion"
import { RadioTower } from "lucide-react"

import { materializePublicSignalReports } from "@/lib/public-signals"
import { cn } from "@/lib/utils"
import type {
  ReportCoordinates,
  ReportRecord,
  SavedLocationPreference,
} from "@/lib/types"

const DynamicEkitiMap = dynamic(
  () => import("@/components/maps/ekiti-map").then((module) => module.EkitiMap),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />,
  }
)

function MapLoadingFallback() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[linear-gradient(180deg,#dce7df_0%,#e5ece6_18%,#edf2ed_100%)]">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(146,161,149,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(146,161,149,0.12)_1px,transparent_1px)] [background-size:5.25rem_5.25rem]" />
      <div className="absolute inset-x-[12%] top-[22%] h-px bg-primary/10" />
      <div className="absolute inset-x-[18%] top-[48%] h-px bg-primary/10" />
      <div className="absolute left-[28%] top-[36%] h-[18%] w-px bg-primary/10" />
      <div className="absolute left-[54%] top-[16%] h-[42%] w-px bg-primary/10" />

      {[
        "left-[42%] top-[46%]",
        "left-[47%] top-[44%]",
        "left-[54%] top-[52%]",
        "left-[61%] top-[40%]",
      ].map((position, index) => (
        <span
          key={position}
          className={cn(
            "absolute inline-flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-accent shadow-[0_10px_26px_-18px_rgba(112,81,15,0.58)] animate-pulse",
            position
          )}
          style={{ animationDelay: `${index * 0.18}s` }}
        >
          <span className="size-1.5 rounded-full bg-white" />
        </span>
      ))}

      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/18 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-primary/22 via-transparent to-transparent" />
      <div className="absolute left-4 top-28 rounded-full border border-white/65 bg-white/84 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-[0_16px_38px_-28px_rgba(9,31,22,0.38)] backdrop-blur-xl">
        Loading Ekiti signals
      </div>
    </div>
  )
}

interface MapViewProps {
  areaLabel: string
  reports: ReportRecord[]
  focusCoordinates?: ReportCoordinates | null
  activeReportId?: string | null
  locationPreference: SavedLocationPreference
  framed?: boolean
  showLegend?: boolean
  showSignalSummary?: boolean
  showCriticalChip?: boolean
  onSelectReport?: (report: ReportRecord) => void
}

export function MapView({
  areaLabel,
  reports,
  focusCoordinates,
  activeReportId,
  locationPreference,
  framed = false,
  showLegend = true,
  showSignalSummary = true,
  showCriticalChip = true,
  onSelectReport,
}: MapViewProps) {
  const publicReports = useMemo(() => materializePublicSignalReports(reports), [reports])
  const openSignals = publicReports.filter(
    (report) => !["Resolved", "Closed"].includes(report.status)
  ).length
  const criticalSignals = publicReports.filter(
    (report) =>
      report.severity === "critical" && !["Resolved", "Closed", "Rejected"].includes(report.status)
  )
  const highlightedCriticalSignal = criticalSignals[0] ?? null

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,#d7e2da_0%,#deebe2_18%,#e9f0ea_100%)]" />

      <DynamicEkitiMap
        reports={publicReports}
        centerCoordinates={focusCoordinates}
        userCoordinates={
          locationPreference.permission === "granted"
            ? locationPreference.coordinates ?? locationPreference.lastKnownCoordinates
            : undefined
        }
        activeReportId={activeReportId}
        onReportSelect={onSelectReport}
        className={cn(
          "absolute inset-0 z-0 rounded-none",
          "h-full"
        )}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,23,17,0.22)_0%,rgba(8,23,17,0.06)_14%,rgba(8,23,17,0)_42%,rgba(8,23,17,0.26)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-[radial-gradient(circle_at_bottom,rgba(15,92,67,0.16),transparent_60%)]" />

      {showSignalSummary ? (
        <motion.div
          className={cn(
            "pointer-events-none absolute z-20 rounded-[1.4rem] border border-white/16 bg-primary/72 px-3.5 py-2.5 text-white shadow-[0_22px_48px_-30px_rgba(5,16,12,0.78)] backdrop-blur-2xl",
            framed ? "left-4 top-4 md:left-5" : "left-4 top-[6.25rem] md:left-6"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-white/12 text-accent">
              <RadioTower className="size-4" />
            </div>
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/68">
                Active signals
              </p>
              <p className="text-sm font-semibold">
                {openSignals} public signals around {areaLabel}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}

      {showCriticalChip && highlightedCriticalSignal ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.35 }}
          className={cn(
            "pointer-events-none absolute z-20 rounded-full border border-white/16 bg-[rgba(154,38,28,0.78)] px-3 py-2 text-[0.72rem] font-semibold text-white shadow-[0_20px_46px_-30px_rgba(90,18,12,0.76)] backdrop-blur-2xl",
            framed ? "bottom-4 left-4 md:left-5" : "bottom-[10rem] left-4 md:left-6"
          )}
        >
          Critical now: {highlightedCriticalSignal.category} in {highlightedCriticalSignal.location.lga}
        </motion.div>
      ) : null}

      {showLegend ? (
        <div
          className={cn(
            "pointer-events-none absolute z-20 hidden rounded-[1.35rem] border border-white/56 bg-white/82 px-3.5 py-3 shadow-[0_18px_44px_-28px_rgba(9,31,22,0.34)] backdrop-blur-2xl md:block",
            framed ? "left-4 top-[5.15rem] md:left-5" : "left-4 top-[9.75rem]"
          )}
        >
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-primary/70">
            Public status legend
          </p>
          <div className="mt-2 grid gap-1.5 text-[0.72rem] text-foreground">
            {[
              ["Critical", "bg-[#b84232]"],
              ["In progress", "bg-[#d28c16]"],
              ["Under review", "bg-[#d3a63a]"],
              ["Assigned", "bg-[#2378d4]"],
              ["Resolved", "bg-[#0f8b67]"],
              ["Closed", "bg-[#7f8782]"],
            ].map(([label, colorClass]) => (
              <div key={label} className="flex items-center gap-2">
                <span className={cn("size-2.5 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,0.78)]", colorClass)} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
