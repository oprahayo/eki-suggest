"use client"

import { startTransition, useDeferredValue, useMemo, useState } from "react"
import { AlertTriangle, Filter, Search } from "lucide-react"

import { MapView } from "@/components/citizen/home/map-view"
import { PublicSignalSheet } from "@/components/citizen/home/public-signal-sheet"
import { buttonVariants } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useReportCenter } from "@/hooks/use-report-center"
import { formatLagosTimestamp } from "@/lib/dates"
import { ekitiLgas } from "@/lib/ekiti"
import { materializePublicSignalReports } from "@/lib/public-signals"
import { reportCategories, type ReportCategory, type ReportRecord } from "@/lib/types"
import { cn } from "@/lib/utils"

type SignalScope =
  | "all"
  | "critical"
  | "under-review"
  | "assigned"
  | "in-progress"
  | "resolved"
  | "closed"

const scopeConfig: Array<{
  value: SignalScope
  label: string
  match: (report: ReportRecord) => boolean
}> = [
  { value: "all", label: "All", match: () => true },
  {
    value: "critical",
    label: "Critical",
    match: (report) =>
      report.severity === "critical" &&
      !["Resolved", "Closed", "Rejected"].includes(report.status),
  },
  {
    value: "under-review",
    label: "Under Review",
    match: (report) => report.status === "Under Review" || report.status === "Received",
  },
  { value: "assigned", label: "Assigned", match: (report) => report.status === "Assigned" },
  {
    value: "in-progress",
    label: "In Progress",
    match: (report) => report.status === "In Progress",
  },
  { value: "resolved", label: "Resolved", match: (report) => report.status === "Resolved" },
  {
    value: "closed",
    label: "Closed",
    match: (report) => report.status === "Closed" || report.status === "Rejected",
  },
] as const

const legendItems = [
  { label: "Critical", color: "bg-[#b84232]" },
  { label: "In progress", color: "bg-[#d28c16]" },
  { label: "Under review", color: "bg-[#d3a63a]" },
  { label: "Assigned", color: "bg-[#2378d4]" },
  { label: "Resolved", color: "bg-[#0f8b67]" },
  { label: "Closed", color: "bg-[#7f8782]" },
] as const

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "interactive-press rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
        active
          ? "border-primary/20 bg-primary/[0.08] text-primary"
          : "border-white/66 bg-white/84 text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function SignalRow({
  report,
  active,
  onClick,
}: {
  report: ReportRecord
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "surface-muted interactive-press w-full rounded-[1.35rem] border px-4 py-3.5 text-left",
        active ? "border-primary/16 bg-primary/[0.06]" : "border-transparent"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-foreground">{report.title}</p>
          <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary/72">
            {report.category}
          </p>
        </div>
        {report.severity === "critical" ? (
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#b84232]/10 text-[#b84232]">
            <AlertTriangle className="size-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {[report.location.area || report.location.community, report.location.lga]
          .filter(Boolean)
          .join(", ")}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{report.status}</span>
        <span>{formatLagosTimestamp(report.updatedAt)}</span>
      </div>
    </button>
  )
}

function SignalsSidebar({
  counts,
  scope,
  setScope,
  search,
  setSearch,
  selectedLga,
  setSelectedLga,
  selectedCategory,
  setSelectedCategory,
  visibleReports,
  selectedReport,
  setSelectedReport,
  resolvedSignals,
}: {
  counts: Array<{ value: SignalScope; label: string; count: number }>
  scope: SignalScope
  setScope: (value: SignalScope) => void
  search: string
  setSearch: (value: string) => void
  selectedLga: string
  setSelectedLga: (value: string) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  visibleReports: ReportRecord[]
  selectedReport: ReportRecord | null
  setSelectedReport: (report: ReportRecord) => void
  resolvedSignals: number
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/58 px-4 py-4 sm:px-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/72">
          Filters
        </p>
        <p className="mt-2 hidden text-sm leading-6 text-muted-foreground md:block">
          Search, narrow the list, and open any report on the map.
        </p>
      </div>

      <div className="space-y-4 border-b border-white/58 px-4 py-4 sm:px-5">
        <InputGroup>
          <InputGroupInput
            value={search}
            onChange={(event) =>
              startTransition(() => {
                setSearch(event.target.value)
              })
            }
            placeholder="Search title, area, or ticket"
          />
          <InputGroupAddon align="inline-end">
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>

        <div className="grid gap-3">
          <div>
            <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary/70">
              LGA
            </p>
            <select
              value={selectedLga}
              onChange={(event) => setSelectedLga(event.target.value)}
              className="w-full rounded-[1rem] border border-white/70 bg-white/84 px-3 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.52)] outline-none focus:border-primary/30"
            >
              <option value="all">All LGAs</option>
              {ekitiLgas.map((lga) => (
                <option key={lga.name} value={lga.name}>
                  {lga.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary/70">
              Category
            </p>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-[1rem] border border-white/70 bg-white/84 px-3 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.52)] outline-none focus:border-primary/30"
            >
              <option value="all">All categories</option>
              {reportCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary/70">
            Status
          </p>
          <div className="flex flex-wrap gap-2">
            {counts.map((item) => (
              <FilterChip
                key={item.value}
                active={scope === item.value}
                onClick={() => setScope(item.value)}
              >
                {item.label} ({item.count})
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/72">
              Visible reports
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">
              Report list
            </h2>
          </div>
          <span className="rounded-full bg-primary/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
            {visibleReports.length}
          </span>
        </div>

        <div className="space-y-2">
          {visibleReports.length > 0 ? (
            visibleReports.map((report) => (
              <SignalRow
                key={report.id}
                report={report}
                active={selectedReport?.id === report.id}
                onClick={() => setSelectedReport(report)}
              />
            ))
          ) : (
            <div className="surface-muted rounded-[1.35rem] px-4 py-4">
              <p className="text-sm font-semibold text-foreground">No reports match this view</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Change the filter or clear your search to show more public signals.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/58 px-4 py-4 sm:px-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/72">
          Legend
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="rounded-full border border-white/66 bg-white/82 px-3 py-2 shadow-[0_14px_32px_-28px_rgba(9,31,22,0.24)]"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
                <span className={cn("size-2.5 rounded-full", item.color)} />
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-[1.25rem] border border-primary/12 bg-primary/[0.05] px-4 py-3">
          <p className="text-sm leading-6 text-muted-foreground">
            {resolvedSignals} public reports have already been closed or resolved.
          </p>
        </div>
      </div>
    </div>
  )
}

export function PublicSignalsView() {
  const { reports, selectedArea, locationPreference } = useReportCenter()
  const [scope, setScope] = useState<SignalScope>("all")
  const [search, setSearch] = useState("")
  const [selectedLga, setSelectedLga] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const deferredSearch = useDeferredValue(search)

  const publicReports = useMemo(
    () => materializePublicSignalReports(reports),
    [reports]
  )

  const visibleReports = useMemo(() => {
    const activeScope = scopeConfig.find((item) => item.value === scope) ?? scopeConfig[0]
    const normalizedQuery = deferredSearch.trim().toLowerCase()

    return publicReports.filter((report) => {
      const matchesScope = activeScope.match(report)
      const matchesLga = selectedLga === "all" ? true : report.location.lga === selectedLga
      const matchesCategory =
        selectedCategory === "all" ? true : report.category === (selectedCategory as ReportCategory)
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : [
              report.title,
              report.category,
              report.trackingNumber,
              report.location.area,
              report.location.community,
              report.location.lga,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)

      return matchesScope && matchesLga && matchesCategory && matchesSearch
    })
  }, [deferredSearch, publicReports, scope, selectedCategory, selectedLga])

  const counts = useMemo(
    () =>
      scopeConfig.map((item) => ({
        ...item,
        count: publicReports.filter((report) => item.match(report)).length,
      })),
    [publicReports]
  )

  const summary = useMemo(() => {
    const activeSignals = publicReports.filter(
      (report) => !["Resolved", "Closed", "Rejected"].includes(report.status)
    ).length
    const resolvedSignals = publicReports.filter(
      (report) => report.status === "Resolved" || report.status === "Closed"
    ).length
    const criticalSignals = publicReports.filter(
      (report) =>
        report.severity === "critical" &&
        !["Resolved", "Closed", "Rejected"].includes(report.status)
    ).length

    return {
      activeSignals,
      resolvedSignals,
      criticalSignals,
    }
  }, [publicReports])

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-2 pb-2 sm:px-6">
        <div className="surface-panel flex h-[calc(100dvh-13.75rem-env(safe-area-inset-bottom))] min-h-[25rem] flex-col overflow-hidden rounded-[1.4rem] shadow-soft md:rounded-[2rem]">
          <div className="flex flex-col items-stretch gap-2 border-b border-white/58 px-3 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-5 md:py-4">
            <div className="min-w-0 max-w-2xl flex-1">
              <p className="hidden text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72 md:block">
                Public signals map
              </p>
              <h1 className="text-lg font-semibold leading-snug tracking-tight text-foreground md:mt-2 md:text-[1.8rem]">
                Reports across Ekiti State
              </h1>
              <p role="status" className="mt-1 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-950 md:mt-2 md:px-3 md:text-xs">
                Demo map · No verified live government reports
              </p>
              <p className="mt-2 hidden md:block text-sm leading-6 text-muted-foreground">
                Explore fictional report examples on the Ekiti map. Live cross-device cases and verified office responses are not yet connected.
              </p>
            </div>

            <div className="flex w-full shrink-0 items-center justify-start gap-2 md:w-auto md:flex-wrap md:justify-end">
              <div className="hidden rounded-full border border-white/66 bg-white/82 px-3 py-2 shadow-[0_14px_32px_-28px_rgba(9,31,22,0.24)] md:block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/68">
                  {selectedArea}
                </span>
              </div>
              <div className="hidden rounded-full border border-white/66 bg-white/82 px-3 py-2 shadow-[0_14px_32px_-28px_rgba(9,31,22,0.24)] md:block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/68">
                  {summary.activeSignals} open
                </span>
              </div>
              <div className="hidden rounded-full border border-white/66 bg-white/82 px-3 py-2 shadow-[0_14px_32px_-28px_rgba(9,31,22,0.24)] md:block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/68">
                  {summary.criticalSignals} critical
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-full border-white/70 bg-white/82 md:hidden"
                )}
              >
                <Filter data-icon="inline-start" />
                Filters
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] md:grid-cols-[20rem_minmax(0,1fr)]">
            <aside className="hidden border-r border-white/58 md:block md:min-h-0">
              <SignalsSidebar
                counts={counts}
                scope={scope}
                setScope={setScope}
                search={search}
                setSearch={setSearch}
                selectedLga={selectedLga}
                setSelectedLga={setSelectedLga}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                visibleReports={visibleReports}
                selectedReport={selectedReport}
                setSelectedReport={setSelectedReport}
                resolvedSignals={summary.resolvedSignals}
              />
            </aside>

            <section className="relative min-h-0 p-2 sm:p-4">
              <div className="absolute left-6 top-6 z-20 rounded-full border border-white/66 bg-white/84 px-3 py-2 shadow-[0_18px_42px_-28px_rgba(9,31,22,0.32)] backdrop-blur-xl">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/72">
                  {visibleReports.length} visible
                </span>
              </div>
              <div className="absolute right-6 top-6 z-20 hidden rounded-full border border-white/66 bg-white/84 px-3 py-2 shadow-[0_18px_42px_-28px_rgba(9,31,22,0.32)] backdrop-blur-xl md:block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/72">
                  Ekiti map
                </span>
              </div>

              <div className="h-full min-h-[16rem] overflow-hidden rounded-[1.2rem] md:rounded-[1.6rem]">
                <MapView
                  areaLabel={selectedArea}
                  reports={visibleReports}
                  focusCoordinates={selectedReport?.location.coordinates ?? null}
                  activeReportId={selectedReport?.id ?? null}
                  locationPreference={locationPreference}
                  framed
                  showLegend={false}
                  showSignalSummary={false}
                  showCriticalChip={false}
                  onSelectReport={(report) => {
                    setSelectedReport(report)
                  }}
                />
              </div>
            </section>
          </div>
        </div>
      </section>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          style={{ top: "calc(5.35rem + env(safe-area-inset-top))", bottom: "calc(6.25rem + env(safe-area-inset-bottom))", height: "auto" }}
          className="w-[88vw] overflow-y-auto border-white/50 bg-[linear-gradient(180deg,rgba(249,250,245,0.98),rgba(242,246,239,0.96))] p-0 text-foreground shadow-[0_34px_110px_-56px_rgba(8,28,20,0.54)] backdrop-blur-2xl sm:max-w-sm"
        >
          <SheetHeader className="border-b border-white/58 px-5 pt-5 pb-4">
            <SheetTitle className="text-left text-2xl font-semibold tracking-tight">
              Public signals
            </SheetTitle>
            <SheetDescription className="text-left leading-6">
              Search the demonstration map, filter by area, and open a fictional example.
            </SheetDescription>
          </SheetHeader>

          <SignalsSidebar
            counts={counts}
            scope={scope}
            setScope={setScope}
            search={search}
            setSearch={setSearch}
            selectedLga={selectedLga}
            setSelectedLga={setSelectedLga}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            visibleReports={visibleReports}
            selectedReport={selectedReport}
            setSelectedReport={(report) => {
              setSelectedReport(report)
              setMobileSidebarOpen(false)
            }}
            resolvedSignals={summary.resolvedSignals}
          />
        </SheetContent>
      </Sheet>

      <PublicSignalSheet
        report={selectedReport}
        open={Boolean(selectedReport)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReport(null)
          }
        }}
      />
    </>
  )
}
