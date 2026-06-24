"use client"

import Link from "next/link"
import { startTransition, useDeferredValue, useMemo, useState } from "react"
import { NotebookPen, Search } from "lucide-react"

import { AuthRequiredCard } from "@/components/citizen/auth-required-card"
import { PageShell } from "@/components/citizen/page-shell"
import { ReportListItem } from "@/components/citizen/reports/report-list-item"
import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useAuth } from "@/hooks/use-auth"
import { useReportCenter } from "@/hooks/use-report-center"
import { civicProfile } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

type ReportScope =
  | "open"
  | "under-review"
  | "assigned"
  | "in-progress"
  | "resolved"
  | "closed"
  | "rejected"

const scopeConfig: Array<{
  value: ReportScope
  label: string
  statuses: string[]
}> = [
  { value: "open", label: "Open", statuses: ["Received"] },
  { value: "under-review", label: "Under Review", statuses: ["Under Review"] },
  { value: "assigned", label: "Assigned", statuses: ["Assigned"] },
  { value: "in-progress", label: "In Progress", statuses: ["In Progress"] },
  { value: "resolved", label: "Resolved", statuses: ["Resolved"] },
  { value: "closed", label: "Closed", statuses: ["Closed"] },
  { value: "rejected", label: "Rejected", statuses: ["Rejected"] },
]

function ReportsLoadingState() {
  return (
    <PageShell
      eyebrow="Citizen history"
      title="My Reports"
      description="Report history and tracking"
    >
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-panel rounded-[1.5rem] px-4 py-4 shadow-soft">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="mt-3 h-8 w-16 rounded-2xl" />
          </div>
        ))}
      </div>
      <div className="surface-panel rounded-[1.85rem] p-4 shadow-soft">
        <Skeleton className="h-12 w-full rounded-[1.2rem]" />
        <div className="mt-4 flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="surface-panel rounded-[1.85rem] p-3 shadow-soft">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="mb-3 h-24 rounded-[1.5rem] last:mb-0" />
        ))}
      </div>
    </PageShell>
  )
}

export function ReportsView() {
  const { hydrated: authReady, isAuthenticated } = useAuth()
  const { reports, savedDraft, pendingSubmissions, isSyncingPendingSubmissions } =
    useReportCenter()
  const [search, setSearch] = useState("")
  const [scope, setScope] = useState<ReportScope>("open")
  const deferredSearch = useDeferredValue(search)

  const visibleReports = useMemo(() => {
    const activeScope = scopeConfig.find((item) => item.value === scope) ?? scopeConfig[0]

    return reports.filter((report) => {
      const matchesScope = activeScope.statuses.includes(report.status)
      const matchesSearch =
        deferredSearch.length === 0
          ? true
          : [report.title, report.trackingNumber, report.location.community, report.location.area]
              .join(" ")
              .toLowerCase()
              .includes(deferredSearch.toLowerCase())

      return matchesScope && matchesSearch
    })
  }, [deferredSearch, reports, scope])

  const reportCounts = useMemo(
    () =>
      scopeConfig.map((item) => ({
        ...item,
        count: reports.filter((report) => item.statuses.includes(report.status)).length,
      })),
    [reports]
  )

  if (!authReady) {
    return <ReportsLoadingState />
  }

  if (!isAuthenticated) {
    return (
      <PageShell
        eyebrow="Citizen history"
        title="My Reports"
        description="Report history and tracking"
      >
        <AuthRequiredCard
          title="Sign in to keep your personal report history in one place"
          description="My Reports is where your submitted issues, review outcomes, civic score decisions, and badge-review cases stay organized. Public issue browsing and tracking still remain open without a login."
        />
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Citizen history"
      title="My Reports"
      description="Report history and tracking"
      actions={
        <Link
          href="/report/new"
          className={cn(buttonVariants({ size: "lg" }), "rounded-[1.25rem]")}
        >
          <NotebookPen data-icon="inline-start" />
          New Report
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Verified", value: civicProfile.verifiedReports, tone: "text-primary" },
            { label: "Badge review", value: civicProfile.rewardEligibleCount, tone: "text-foreground" },
            { label: "Resolved", value: reportCounts.find((item) => item.value === "resolved")?.count ?? 0, tone: "text-foreground" },
            { label: "In progress", value: reportCounts.find((item) => item.value === "in-progress")?.count ?? 0, tone: "text-foreground" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-full border border-white/66 bg-white/80 px-3 py-2 shadow-[0_14px_32px_-28px_rgba(9,31,22,0.24)]"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {item.label}
              </span>
              <span className={cn("ml-2 text-sm font-semibold", item.tone)}>{item.value}</span>
            </div>
          ))}
        </div>

        {pendingSubmissions.length > 0 ? (
          <div className="surface-panel rounded-[1.75rem] border border-primary/15 bg-primary/5 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-primary">Offline outbox</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {isSyncingPendingSubmissions
                    ? "Saved submissions are being restored into your report history now."
                    : "These reports were saved while you were offline and will send automatically when signal returns."}
                </p>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.46)]">
                {pendingSubmissions.length} queued
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {pendingSubmissions.map((pendingSubmission) => (
                <div
                  key={pendingSubmission.id}
                  className="surface-muted rounded-[1.45rem] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                      {pendingSubmission.payload.kind}
                    </span>
                    <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {pendingSubmission.payload.category}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {pendingSubmission.payload.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[
                      pendingSubmission.payload.location.area ||
                        pendingSubmission.payload.location.community,
                      pendingSubmission.payload.location.lga,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {savedDraft ? (
          <div className="surface-panel rounded-[1.75rem] border border-primary/15 bg-primary/5 px-5 py-4">
            <p className="text-sm font-semibold text-primary">Saved draft available</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {savedDraft.title || "Untitled draft"} •{" "}
              {savedDraft.location.community || "Location still incomplete"}
            </p>
            <Link
              href="/report/new"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-4 rounded-[1.15rem]"
              )}
            >
              Resume draft
            </Link>
          </div>
        ) : null}

        <div className="surface-panel rounded-[1.85rem] p-4 shadow-soft">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full lg:max-w-sm">
                <InputGroup>
                  <InputGroupInput
                    value={search}
                    onChange={(event) =>
                      startTransition(() => {
                        setSearch(event.target.value)
                      })
                    }
                    placeholder="Search tracking number, title, or area"
                  />
                  <InputGroupAddon align="inline-end">
                    <Search className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Open any report to review its current status and public timeline.
              </p>
            </div>
            <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ToggleGroup
                value={[scope]}
                onValueChange={(nextValue) => {
                  if (nextValue[0]) {
                    setScope(nextValue[0] as ReportScope)
                  }
                }}
                variant="outline"
                spacing={2}
              >
                {reportCounts.map((item) => (
                  <ToggleGroupItem key={item.value} value={item.value}>
                    {item.label} ({item.count})
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs leading-5 text-muted-foreground">
            <span>Search by tracking number, report title, or short location.</span>
            <span className="text-border">•</span>
            <span>{civicProfile.verifiedReports} verified submissions on this profile</span>
            <span className="text-border">•</span>
            <span>{civicProfile.rewardEligibleCount} badge review item(s)</span>
          </div>
        </div>

        {visibleReports.length > 0 ? (
          <div className="surface-panel space-y-3 rounded-[1.85rem] p-3 shadow-soft">
            {visibleReports.map((report) => (
              <ReportListItem key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <Empty className="rounded-[1.75rem] border-white/60 bg-white/82">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search className="size-4" />
              </EmptyMedia>
              <EmptyTitle>No reports match this filter</EmptyTitle>
              <EmptyDescription>
                Try another keyword or switch to a different lifecycle stage.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                href="/report/new"
                className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
              >
                Create a report
              </Link>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </PageShell>
  )
}
