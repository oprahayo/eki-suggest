import { format } from "date-fns"
import {
  Archive,
  CheckCheck,
  ClipboardCheck,
  Clock3,
  OctagonX,
  ShieldCheck,
  UserRoundCheck,
  Wrench,
} from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import { reportStatuses, type ReportRecord, type ReportStatus, type ReportUpdate } from "@/lib/types"

const statusIcons: Record<ReportStatus, typeof Clock3> = {
  Received: ClipboardCheck,
  "Under Review": ShieldCheck,
  Assigned: UserRoundCheck,
  "In Progress": Wrench,
  Resolved: CheckCheck,
  Closed: Archive,
  Rejected: OctagonX,
}

const normalPath: ReportStatus[] = [
  "Received",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
]

const rejectedPath: ReportStatus[] = ["Received", "Under Review", "Rejected"]

function getVisibleUpdate(report: ReportRecord, status: ReportStatus) {
  return report.updates
    .filter((update) => update.visibility === "public" && update.status === status)
    .toSorted((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
    .at(-1)
}

function getTimelineState(report: ReportRecord, status: ReportStatus) {
  const path = report.status === "Rejected" ? rejectedPath : normalPath
  const currentIndex = path.indexOf(report.status)
  const statusIndex = path.indexOf(status)

  if (statusIndex === -1) {
    return "pending" as const
  }

  if (statusIndex < currentIndex) {
    return "completed" as const
  }

  if (statusIndex === currentIndex) {
    return "current" as const
  }

  return "pending" as const
}

function getPlaceholderNote(status: ReportStatus) {
  switch (status) {
    case "Received":
      return "Ticket creation confirms the issue entered the accountability queue."
    case "Under Review":
      return "The moderation desk will verify the report and confirm the right route."
    case "Assigned":
      return "This step confirms a responsible office or handler queue has accepted ownership."
    case "In Progress":
      return "Field or desk action notes appear here once work begins."
    case "Resolved":
      return "A resolution note appears here when the issue is considered fixed or answered."
    case "Closed":
      return "Closure confirms the ticket was completed or finalized after verification."
    case "Rejected":
      return "If a report is rejected, the public-safe reason appears here."
  }
}

function TimelineEntry({
  status,
  update,
  state,
  showConnector,
}: {
  status: ReportStatus
  update?: ReportUpdate
  state: "completed" | "current" | "pending"
  showConnector: boolean
}) {
  const Icon = statusIcons[status]

  return (
    <div className="relative flex gap-4 pl-2">
      {showConnector ? (
        <span
          className={cn(
            "absolute top-8 left-[1.02rem] h-[calc(100%+1rem)] w-px",
            state === "pending" ? "bg-border/70" : "bg-primary/18"
          )}
        />
      ) : null}
      <div
        className={cn(
          "relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
          state === "completed"
            ? "border-primary bg-primary text-primary-foreground"
            : state === "current"
              ? "border-primary/20 bg-primary/12 text-primary"
              : "border-border/80 bg-white text-muted-foreground"
        )}
      >
        <Icon className="size-4" />
      </div>

      <div
        className={cn(
          "flex-1 rounded-[1.5rem] border p-4 shadow-[0_18px_42px_-32px_rgba(9,31,22,0.34)]",
          state === "current"
            ? "border-primary/18 bg-primary/[0.06]"
            : "border-white/60 bg-white/84"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{status}</p>
          {state !== "pending" ? <StatusBadge status={status} /> : null}
          {update?.isEscalation ? (
            <span className="tone-accent rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
              Escalation
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {update?.note ?? getPlaceholderNote(status)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {update ? (
            <>
              <span>{update.actorName}</span>
              <span className="text-border">•</span>
              <span>{update.actorRole}</span>
              <span className="text-border">•</span>
              <time dateTime={update.createdAt}>
                {format(new Date(update.createdAt), "dd MMM yyyy")}
              </time>
              <span className="text-border">•</span>
              <span>{format(new Date(update.createdAt), "h:mm a")}</span>
            </>
          ) : (
            <span>Waiting for a public update</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function TrackingStatusTimeline({ report }: { report: ReportRecord }) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/86 p-5 shadow-[0_30px_90px_-52px_rgba(12,30,22,0.38)] backdrop-blur sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[1.15rem] bg-primary/10 text-primary">
          <Clock3 className="size-5" />
        </div>
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
            Status timeline
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Follow every public stage of the ticket
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Each stage shows the latest public-safe note, date, time, and escalation signal where
            relevant.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {reportStatuses.map((status, index) => (
          <div key={status}>
            <TimelineEntry
              status={status}
              update={getVisibleUpdate(report, status)}
              state={getTimelineState(report, status)}
              showConnector={index < reportStatuses.length - 1}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
