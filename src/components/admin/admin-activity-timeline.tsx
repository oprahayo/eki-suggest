import { format } from "date-fns"
import { AlertTriangle, MessageSquareText, Shield, ShieldCheck } from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
import type { ReportUpdate } from "@/lib/types"

export function AdminActivityTimeline({ updates }: { updates: ReportUpdate[] }) {
  const orderedUpdates = updates.toSorted(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
  )

  return (
    <div className="overflow-hidden rounded-[1.3rem] border border-white/60 bg-white/74">
      {orderedUpdates.map((update, index) => (
        <article
          key={update.id}
          className={index === 0 ? "px-4 py-4" : "border-t border-white/60 px-4 py-4"}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[0.95rem] bg-primary/[0.08] text-primary">
              {update.isEscalation ? (
                <AlertTriangle className="size-4.5" />
              ) : update.visibility === "internal" ? (
                <Shield className="size-4.5" />
              ) : (
                <MessageSquareText className="size-4.5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{update.title}</p>
                <StatusBadge status={update.status} />
                <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {update.visibility}
                </span>
                {update.isEscalation ? (
                  <span className="tone-accent inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
                    <ShieldCheck className="size-3.5" />
                    Escalation
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{update.note}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{update.actorName}</span>
                <span className="text-border">•</span>
                <span>{update.actorRole}</span>
                <span className="text-border">•</span>
                <time dateTime={update.createdAt}>
                  {format(new Date(update.createdAt), "dd MMM yyyy, h:mm a")}
                </time>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
