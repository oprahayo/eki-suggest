"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react"
import { ShieldCheck } from "lucide-react"

import { PageShell } from "@/components/citizen/page-shell"
import { RecentTrackedTickets } from "@/components/citizen/track/recent-tracked-tickets"
import { TrackingEmptyState } from "@/components/citizen/track/tracking-empty-state"
import { TrackingLoadingState } from "@/components/citizen/track/tracking-loading-state"
import { TrackingMediaGallery } from "@/components/citizen/track/tracking-media-gallery"
import { TrackingPublicNotes } from "@/components/citizen/track/tracking-public-notes"
import { TrackingResultCard } from "@/components/citizen/track/tracking-result-card"
import { TrackingSearchCard } from "@/components/citizen/track/tracking-search-card"
import { TrackingStatusTimeline } from "@/components/citizen/track/tracking-status-timeline"
import { buttonVariants } from "@/components/ui/button"
import { useReportCenter } from "@/hooks/use-report-center"
import { cn } from "@/lib/utils"

export function TrackReportView() {
  const searchParams = useSearchParams()
  const defaultTracking = searchParams.get("tracking") ?? ""
  const [query, setQuery] = useState(defaultTracking)
  const [submittedQuery, setSubmittedQuery] = useState(defaultTracking)
  const deferredQuery = useDeferredValue(submittedQuery)
  const normalizedQuery = deferredQuery.trim().toUpperCase()
  const {
    reports,
    recentTrackedReports,
    findReportByTrackingNumber,
    rememberTrackedTicket,
  } = useReportCenter()

  useEffect(() => {
    setQuery(defaultTracking)
    setSubmittedQuery(defaultTracking)
  }, [defaultTracking])

  const trackedReport = normalizedQuery
    ? findReportByTrackingNumber(normalizedQuery)
    : undefined

  useEffect(() => {
    if (!trackedReport) {
      return
    }

    rememberTrackedTicket(trackedReport.trackingNumber)
  }, [rememberTrackedTicket, trackedReport])

  const localSubmittedReports = useMemo(
    () => reports.filter((report) => report.source === "submitted").slice(0, 4),
    [reports]
  )

  const recentReports = recentTrackedReports.length > 0 ? recentTrackedReports : localSubmittedReports
  const isSearching = submittedQuery !== deferredQuery
  const hasSearch = submittedQuery.trim().length > 0

  return (
    <PageShell
      eyebrow="Transparency"
      title="Track a report"
      description="Search with a tracking number to see the current status, public timeline, assigned office, submitted evidence, and accountability notes."
      actions={
        <Link href="/report/new" className={cn(buttonVariants({ size: "lg" }), "rounded-[1.25rem]")}>
          <ShieldCheck data-icon="inline-start" />
          Report issue
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.85fr)]">
        <div className="space-y-6">
          <TrackingSearchCard
            query={query}
            onQueryChange={setQuery}
            onSubmit={() => {
              startTransition(() => {
                setSubmittedQuery(query)
              })
            }}
            isSearching={isSearching}
            recentCount={recentReports.length}
          />

          {isSearching ? (
            <TrackingLoadingState />
          ) : trackedReport ? (
            <div className="space-y-6">
              <TrackingResultCard report={trackedReport} />
              <TrackingStatusTimeline report={trackedReport} />
              <TrackingMediaGallery media={trackedReport.media} />
            </div>
          ) : (
            <TrackingEmptyState hasQuery={hasSearch} query={normalizedQuery || query.trim()} />
          )}
        </div>

        <aside className="space-y-6">
          <RecentTrackedTickets
            title={recentTrackedReports.length > 0 ? "Your recent lookups" : "Recent local tickets"}
            description={
              recentTrackedReports.length > 0
                ? "Tickets you opened recently stay close so you can return to the exact progress view quickly."
                : "Tracked tickets are remembered on this device for now. When citizen login is fully wired, this list can sync with accounts too."
            }
            reports={recentReports}
            emptyMessage="No tracked tickets yet. Once you search a report or submit one from this device, it will appear here for quick access."
          />

          {trackedReport ? (
            <TrackingPublicNotes report={trackedReport} />
          ) : (
            <section className="rounded-[2rem] border border-white/60 bg-white/84 p-5 shadow-[0_30px_90px_-52px_rgba(12,30,22,0.38)] backdrop-blur sm:p-6">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
                What you will see
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                Transparent, calm progress instead of guesswork
              </h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <p>Each ticket shows a public timeline from receipt through review, assignment, action, and closure.</p>
                <p>When the issue is escalated, the page makes that visible instead of hiding it behind silence.</p>
                <p>Only public-safe notes appear here. Internal moderation details remain private to protect staff and citizens.</p>
              </div>
            </section>
          )}
        </aside>
      </div>
    </PageShell>
  )
}
