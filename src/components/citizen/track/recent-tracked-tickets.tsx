import Link from "next/link"
import { ArrowUpRight, Clock3, MapPin, Ticket } from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { formatLagosTimestamp } from "@/lib/dates"
import { cn } from "@/lib/utils"
import type { ReportRecord } from "@/lib/types"

interface RecentTrackedTicketsProps {
  title: string
  description: string
  reports: ReportRecord[]
  emptyMessage: string
}

export function RecentTrackedTickets({
  title,
  description,
  reports,
  emptyMessage,
}: RecentTrackedTicketsProps) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/84 p-5 shadow-[0_30px_90px_-52px_rgba(12,30,22,0.38)] backdrop-blur sm:p-6">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
        Recent tracked tickets
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>

      {reports.length > 0 ? (
        <div className="mt-5 space-y-3">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-[1.45rem] border border-white/60 bg-white/86 px-4 py-4 shadow-[0_18px_42px_-32px_rgba(9,31,22,0.32)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={report.status} />
                    <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      <Ticket className="size-3.5" />
                      {report.trackingNumber}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{report.title}</p>
                </div>
                <Link
                  href={`/track?tracking=${encodeURIComponent(report.trackingNumber)}`}
                  className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                >
                  <ArrowUpRight />
                  <span className="sr-only">Open tracking page for {report.trackingNumber}</span>
                </Link>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {report.location.area || report.location.community}, {report.location.lga}
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  Updated {formatLagosTimestamp(report.updatedAt)}
                </span>
                <span className="text-border">•</span>
                <span>{report.assignedOfficeName}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.55rem] border border-dashed border-primary/16 bg-primary/[0.04] px-4 py-5 text-sm leading-6 text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </section>
  )
}
