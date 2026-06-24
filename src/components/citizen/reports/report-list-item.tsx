import Link from "next/link"
import type { ComponentType } from "react"
import {
  ArrowUpRight,
  BadgeAlert,
  Building2,
  Construction,
  Droplets,
  GraduationCap,
  HeartPulse,
  Leaf,
  MapPin,
  ShieldAlert,
  Trash2,
  Waves,
  Zap,
} from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
import { formatLagosTimestamp } from "@/lib/dates"
import { cn } from "@/lib/utils"
import type { ReportCategory, ReportRecord } from "@/lib/types"

const categoryMeta: Record<
  ReportCategory,
  {
    icon: ComponentType<{ className?: string }>
    chrome: string
  }
> = {
  Road: { icon: Construction, chrome: "tone-brand-strong" },
  Drainage: { icon: Waves, chrome: "tone-brand" },
  Water: { icon: Droplets, chrome: "tone-brand" },
  Electricity: { icon: Zap, chrome: "tone-accent" },
  Sanitation: { icon: Trash2, chrome: "tone-accent" },
  Health: { icon: HeartPulse, chrome: "tone-accent" },
  Security: { icon: ShieldAlert, chrome: "tone-danger" },
  Education: { icon: GraduationCap, chrome: "tone-neutral" },
  Environment: { icon: Leaf, chrome: "tone-brand" },
  "Public Facility": { icon: Building2, chrome: "tone-neutral" },
  "Corruption / Service Delay": { icon: BadgeAlert, chrome: "tone-accent" },
  Other: { icon: Building2, chrome: "tone-neutral" },
}

export function ReportListItem({ report }: { report: ReportRecord }) {
  const category = categoryMeta[report.category]
  const CategoryIcon = category.icon

  return (
    <Link
      href={`/track?tracking=${encodeURIComponent(report.trackingNumber)}`}
      className="group surface-muted interactive-press flex items-start gap-3 rounded-[1.55rem] px-4 py-4"
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-[1.2rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
          category.chrome
        )}
      >
        <CategoryIcon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          {typeof report.civicPoints === "number" && report.civicPoints > 0 ? (
            <span className="rounded-full bg-accent/20 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground">
              +{report.civicPoints} points
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground">{report.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" />
            {[report.location.area || report.location.community, report.location.lga]
              .filter(Boolean)
              .join(", ")}
          </span>
          <span>{formatLagosTimestamp(report.createdAt)}</span>
          <span>{report.category}</span>
        </div>
      </div>
      <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/84 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.62)] transition-transform group-hover:translate-x-0.5">
        <ArrowUpRight className="size-4" />
      </div>
    </Link>
  )
}
