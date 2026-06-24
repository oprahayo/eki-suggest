import { format } from "date-fns"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  Clock3,
  MapPin,
} from "lucide-react"

import { ModerationFlagBadge, SlaBadge } from "@/components/admin/admin-badges"
import type { AdminReport } from "@/components/admin/admin-utils"
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface AdminSmartTableProps {
  reports: AdminReport[]
  selectedReportId: string | null
  onSelectReport: (reportId: string) => void
  canViewCitizen: boolean
  sortKey: string
  sortDirection: "asc" | "desc"
  onSortChange: (key: string) => void
}

export function AdminSmartTable({
  reports,
  selectedReportId,
  onSelectReport,
  canViewCitizen,
  sortKey,
  sortDirection,
  onSortChange,
}: AdminSmartTableProps) {
  if (reports.length === 0) {
    return (
      <Empty className="rounded-[1.5rem] border-white/60 bg-white/70">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Clock3 className="size-4" />
          </EmptyMedia>
          <EmptyTitle>No reports match the current filters</EmptyTitle>
          <EmptyDescription>
            Broaden the date range or clear a few filters to reopen the working set.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="surface-panel min-w-0 overflow-hidden rounded-[1.75rem] shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-white/60 px-4 py-3.5">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/72">
            Operational list
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a row to open the workbench without losing queue context.
          </p>
        </div>
        <div className="section-chip rounded-full px-3 py-1.5 text-[0.72rem] font-semibold text-primary">
          {reports.length} rows
        </div>
      </div>

      <div className="max-h-[calc(100vh-19rem)] overflow-x-auto overflow-y-auto overscroll-contain">
      <Table className="min-w-[1120px]">
        <TableHeader className="sticky top-0 z-10 bg-[#f4f6f3]">
          <TableRow className="border-white/60 bg-foreground/[0.02]">
            <SortableHead
              label="Ticket"
              columnKey="trackingNumber"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
              className="px-4"
            />
            <SortableHead
              label="Category"
              columnKey="category"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
            />
            <SortableHead
              label="Issue"
              columnKey="title"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
            />
            <TableHead>Citizen</TableHead>
            <SortableHead
              label="Location"
              columnKey="location"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
            />
            <SortableHead
              label="Office"
              columnKey="assignedOfficeName"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
            />
            <SortableHead
              label="Status"
              columnKey="status"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
            />
            <SortableHead
              label="Severity"
              columnKey="severity"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
            />
            <SortableHead
              label="Submitted"
              columnKey="createdAt"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
            />
            <SortableHead
              label="Last update"
              columnKey="latestAuditAt"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={onSortChange}
            />
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow
              key={report.id}
              onClick={() => onSelectReport(report.id)}
              data-state={selectedReportId === report.id ? "selected" : undefined}
              className={cn(
                "interactive-press cursor-pointer border-white/50 align-top",
                selectedReportId === report.id && "bg-primary/[0.05] hover:bg-primary/[0.05]"
              )}
            >
              <TableCell className="px-4">
                <div className="space-y-1">
                  <p className="font-semibold text-primary">{report.trackingNumber}</p>
                  <div className="flex flex-wrap items-center gap-1">
                    <ModerationFlagBadge flag={report.moderationFlag} />
                    {report.escalationCount > 0 ? (
                      <span className="tone-accent inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold">
                        <AlertTriangle className="size-3" />
                        {report.escalationCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="min-w-[10rem]">
                  <p className="font-medium text-foreground">{report.category}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{report.kind}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="min-w-[15rem] whitespace-normal">
                  <p className="font-semibold text-foreground">{report.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {report.description}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="min-w-[9rem]">
                  <p className="font-medium text-foreground">
                    {canViewCitizen ? report.contact.name : "Masked for viewer role"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {canViewCitizen ? report.contact.phone : "Contact hidden"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="min-w-[10rem] text-sm text-foreground">
                  <p className="inline-flex items-center gap-1.5 font-medium">
                    <MapPin className="size-3.5 text-primary" />
                    {report.location.area || report.location.community}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {report.location.ward}, {report.location.lga}
                  </p>
                </div>
              </TableCell>
              <TableCell className="max-w-[13rem]">
                <p className="truncate font-medium text-foreground">{report.assignedOfficeName}</p>
              </TableCell>
              <TableCell>
                <StatusBadge status={report.status} />
              </TableCell>
              <TableCell>
                <SeverityBadge severity={report.severity} />
              </TableCell>
              <TableCell>
                <div className="min-w-[8rem] text-xs text-muted-foreground">
                  <p>{format(new Date(report.createdAt), "dd MMM yyyy")}</p>
                  <p className="mt-1">{format(new Date(report.createdAt), "h:mm a")}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="min-w-[8rem] text-xs text-muted-foreground">
                  <p>{format(new Date(report.latestAuditAt), "dd MMM yyyy")}</p>
                  <p className="mt-1">{format(new Date(report.latestAuditAt), "h:mm a")}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex min-w-[7rem] items-center justify-between gap-2">
                  <SlaBadge state={report.slaState} />
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Inspect
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}

function SortableHead({
  label,
  columnKey,
  sortKey,
  sortDirection,
  onSortChange,
  className,
}: {
  label: string
  columnKey: string
  sortKey: string
  sortDirection: "asc" | "desc"
  onSortChange: (key: string) => void
  className?: string
}) {
  const isActive = sortKey === columnKey

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSortChange(columnKey)}
        className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-foreground transition-colors hover:text-primary"
      >
        {label}
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUp className="size-3.5 text-primary" />
          ) : (
            <ArrowDown className="size-3.5 text-primary" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 text-muted-foreground/70" />
        )}
      </button>
    </TableHead>
  )
}
