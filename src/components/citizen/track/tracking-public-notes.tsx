import { format } from "date-fns"
import { MessageSquareText, ShieldAlert } from "lucide-react"

import type { ReportRecord } from "@/lib/types"

export function TrackingPublicNotes({ report }: { report: ReportRecord }) {
  const publicNotes = report.updates
    .filter((update) => update.visibility === "public")
    .toSorted((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/86 p-5 shadow-[0_30px_90px_-52px_rgba(12,30,22,0.38)] backdrop-blur sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[1.15rem] bg-primary/10 text-primary">
          <MessageSquareText className="size-5" />
        </div>
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
            Public response notes
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Citizen-safe notes from the handling process
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            These updates explain what has happened so far without exposing internal-only moderation
            or staff details.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {publicNotes.map((update) => (
          <article
            key={update.id}
            className="rounded-[1.45rem] border border-white/60 bg-white/86 px-4 py-4 shadow-[0_18px_42px_-32px_rgba(9,31,22,0.32)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{update.title}</p>
              {update.isEscalation ? (
                <span className="tone-accent inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
                  <ShieldAlert className="size-3.5" />
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
          </article>
        ))}
      </div>
    </section>
  )
}
