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

import { buttonVariants } from "@/components/ui/button"
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge"
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
  Road: {
    icon: Construction,
    chrome: "tone-brand-strong",
  },
  Drainage: {
    icon: Waves,
    chrome: "tone-brand",
  },
  Water: {
    icon: Droplets,
    chrome: "tone-brand",
  },
  Electricity: {
    icon: Zap,
    chrome: "tone-accent",
  },
  Sanitation: {
    icon: Trash2,
    chrome: "tone-accent",
  },
  Health: {
    icon: HeartPulse,
    chrome: "tone-accent",
  },
  Security: {
    icon: ShieldAlert,
    chrome: "tone-danger",
  },
  Education: {
    icon: GraduationCap,
    chrome: "tone-neutral",
  },
  Environment: {
    icon: Leaf,
    chrome: "tone-brand",
  },
  "Public Facility": {
    icon: Building2,
    chrome: "tone-neutral",
  },
  "Corruption / Service Delay": {
    icon: BadgeAlert,
    chrome: "tone-accent",
  },
  Other: {
    icon: Building2,
    chrome: "tone-neutral",
  },
}

const rewardStatusLabel = {
  under_review: "Badge review",
  eligible: "Badge eligible",
  rewarded: "Badge awarded",
  not_eligible: "No badge",
} as const

export function ReportCard({
  report,
  compact = false,
}: {
  report: ReportRecord
  compact?: boolean
}) {
  const category = categoryMeta[report.category]
  const CategoryIcon = category.icon

  return (
    <article className="surface-panel relative overflow-hidden rounded-[1.85rem] p-4 shadow-soft">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(17,93,69,0.06),transparent)]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-[1.2rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
              category.chrome
            )}
          >
            <CategoryIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {report.category}
            </p>
            <h3 className="mt-2 text-base font-semibold tracking-tight text-foreground">
              {report.title}
            </h3>
          </div>
        </div>

        <Link
          href={`/track?tracking=${report.trackingNumber}`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "rounded-[1.05rem] bg-white/66"
          )}
        >
          <ArrowUpRight />
          <span className="sr-only">Open tracking page</span>
        </Link>
      </div>

      <div className={cn("mt-3 flex flex-wrap items-center gap-2", compact && "mt-2")}>
        <StatusBadge status={report.status} />
        <SeverityBadge severity={report.severity} />
        <span className="rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {report.kind}
        </span>
        {report.rewardStatus ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
            {rewardStatusLabel[report.rewardStatus]}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">{report.description}</p>

      <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="surface-muted rounded-[1.15rem] px-3 py-2.5">
          <p className="text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
            Location
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <MapPin className="size-3.5 text-primary" />
            {[report.location.community, report.location.lga].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="surface-muted rounded-[1.15rem] px-3 py-2.5">
          <p className="text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
            Handling office
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{report.assignedOfficeName}</p>
        </div>
        <div className="surface-muted rounded-[1.15rem] px-3 py-2.5">
          <p className="text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
            Submitted
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {formatLagosTimestamp(report.createdAt)}
          </p>
        </div>
        <div className="surface-muted rounded-[1.15rem] px-3 py-2.5">
          <p className="text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
            Tracking
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{report.trackingNumber}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{report.estimatedResponse}</span>
        <div className="flex flex-wrap items-center gap-3">
          {report.verificationLabel ? <span>{report.verificationLabel}</span> : null}
          {typeof report.civicPoints === "number" ? (
            <span className="font-semibold text-primary">+{report.civicPoints} civic points</span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
