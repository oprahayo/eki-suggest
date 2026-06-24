import { CheckCircle2, Clock3 } from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
import { formatLagosTimestamp } from "@/lib/dates"
import type { ReportUpdate } from "@/lib/types"

export function ReportTimeline({
  updates,
  showInternal = false,
}: {
  updates: ReportUpdate[]
  showInternal?: boolean
}) {
  const visibleUpdates = updates.filter(
    (update) => showInternal || update.visibility === "public"
  )

  return (
    <div className="flex flex-col gap-4">
      {visibleUpdates.map((update, index) => (
        <div key={update.id} className="relative flex gap-4 pl-2">
          {index < visibleUpdates.length - 1 ? (
            <span className="absolute top-7 left-[0.95rem] h-[calc(100%+1rem)] w-px bg-border" />
          ) : null}
          <div className="z-10 mt-0.5 flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            {update.status === "Resolved" || update.status === "Closed" ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <Clock3 className="size-3.5" />
            )}
          </div>
          <div className="flex-1 rounded-[1.4rem] border border-border/70 bg-white/80 p-4 shadow-sm shadow-emerald-950/5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{update.title}</p>
              <StatusBadge status={update.status} />
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{update.note}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{update.actorName}</span>
              <span className="text-border">•</span>
              <span>{update.actorRole}</span>
              <span className="text-border">•</span>
              <time dateTime={update.createdAt}>
                {formatLagosTimestamp(update.createdAt)}
              </time>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
