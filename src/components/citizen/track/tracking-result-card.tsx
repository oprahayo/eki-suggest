import { AlertTriangle, Clock3, MapPin, Ticket, Waves } from "lucide-react"

import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge"
import { formatLagosTimestamp } from "@/lib/dates"
import type { ReportRecord } from "@/lib/types"

function buildLocationLabel(report: ReportRecord) {
  return [
    report.location.area,
    report.location.community,
    report.location.ward,
    report.location.lga,
    report.location.state,
  ]
    .filter(Boolean)
    .join(", ")
}

export function TrackingResultCard({ report }: { report: ReportRecord }) {
  const hasEscalation = report.updates.some(
    (update) => update.visibility === "public" && update.isEscalation
  )

  return (
    <section className="surface-panel overflow-hidden rounded-[2.1rem] shadow-float">
      <div className="border-b border-white/60 bg-[radial-gradient(circle_at_top_right,rgba(15,92,67,0.14),transparent_36%),linear-gradient(180deg,rgba(15,92,67,0.08),rgba(255,255,255,0))] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          <SeverityBadge severity={report.severity} />
          <span className="rounded-full bg-foreground/[0.05] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {report.category}
          </span>
          {hasEscalation ? (
            <span className="tone-accent rounded-full px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
              Escalated
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
              <Ticket className="size-3.5" />
              {report.trackingNumber}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
              {report.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{report.description}</p>
          </div>

          <div className="surface-muted rounded-[1.45rem] border border-primary/16 px-4 py-3 shadow-[0_16px_42px_-30px_rgba(9,31,22,0.24)]">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary/72">
              Last updated
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {formatLagosTimestamp(report.updatedAt)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {report.deliveryState === "device-only" ? "Local-only record; not officially received" : report.verificationLabel ?? "Fictional preview update"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 sm:px-6">
        <div className="surface-muted rounded-[1.45rem] px-4 py-3.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {report.deliveryState === "device-only" ? "Suggested desk (not contacted)" : "Example handling office"}
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {report.assignedOfficeName || "Awaiting assignment"}
          </p>
        </div>
        <div className="surface-muted rounded-[1.45rem] px-4 py-3.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {report.deliveryState === "device-only" ? "Saved on device" : "Example submission date"}
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {formatLagosTimestamp(report.createdAt)}
          </p>
        </div>
        <div className="surface-muted rounded-[1.45rem] px-4 py-3.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Location
          </p>
          <p className="mt-2 inline-flex items-start gap-2 text-sm font-semibold text-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{buildLocationLabel(report)}</span>
          </p>
        </div>
        <div className="surface-muted rounded-[1.45rem] px-4 py-3.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Current status
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock3 className="size-4 text-primary" />
            <span>{report.deliveryState === "device-only" ? "Local draft · Not submitted" : report.status}</span>
          </p>
        </div>
        <div className="surface-muted rounded-[1.45rem] px-4 py-3.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Evidence and score
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {report.media.length} media item{report.media.length === 1 ? "" : "s"}
            {typeof report.civicPoints === "number" ? ` • ${report.civicPoints} civic points` : ""}
          </p>
        </div>
        <div className="surface-muted rounded-[1.45rem] px-4 py-3.5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Estimated response
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">{report.estimatedResponse}</p>
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="surface-accent rounded-[1.6rem] px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="icon-accent flex size-11 shrink-0 items-center justify-center rounded-[1.1rem]">
              {hasEscalation ? <AlertTriangle className="size-5" /> : <Waves className="size-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {hasEscalation
                  ? "This ticket has been escalated for additional attention"
                  : "Transparent updates appear here as the issue moves forward"}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {hasEscalation
                  ? "A public escalation note is now part of the ticket timeline, making it easier to see where intervention increased."
                  : "The tracking page only shows public-safe progress notes, timestamps, and visible assignment details."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
