"use client"

import Link from "next/link"
import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import {
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  House,
  LogOut,
} from "lucide-react"
import { toast } from "sonner"

import { AdminAssignmentModal } from "@/components/admin/admin-assignment-modal"
import { RoleBadge, SlaBadge } from "@/components/admin/admin-badges"
import { AdminFilterBar } from "@/components/admin/admin-filter-bar"
import { AdminLoginScreen } from "@/components/admin/admin-login-screen"
import { AdminMediaLightbox } from "@/components/admin/admin-media-lightbox"
import { AdminReportWorkbenchPanel } from "@/components/admin/admin-report-workbench-panel"
import { AdminSmartTable } from "@/components/admin/admin-smart-table"
import type {
  AdminFilterState,
  AdminOverride,
  AdminReport,
  AdminSession,
  ModerationFlag,
} from "@/components/admin/admin-utils"
import {
  buildAdminReport,
  createAuditUpdate,
  defaultAdminFilters,
  getRolePermissions,
  roleLabel,
} from "@/components/admin/admin-utils"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useReportCenter } from "@/hooks/use-report-center"
import { getOfficeById, offices } from "@/lib/routing"
import type { ReportMedia, ReportStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const ADMIN_SESSION_KEY = "ekisignal.admin.session.v1"
const ADMIN_WORKSPACE_KEY = "ekisignal.admin.workspace.v1"
type AdminSortKey =
  | "latestAuditAt"
  | "createdAt"
  | "trackingNumber"
  | "category"
  | "title"
  | "location"
  | "assignedOfficeName"
  | "status"
  | "severity"

const severityRank: Record<string, number> = {
  critical: 3,
  urgent: 2,
  routine: 1,
}

const statusRank: Record<string, number> = {
  Received: 1,
  "Under Review": 2,
  Assigned: 3,
  "In Progress": 4,
  Resolved: 5,
  Closed: 6,
  Rejected: 7,
}

function toCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map(toCsvValue).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function buildSearchableText(report: AdminReport) {
  return [
    report.trackingNumber,
    report.title,
    report.description,
    report.category,
    report.status,
    report.location.area,
    report.location.community,
    report.location.ward,
    report.location.lga,
    report.location.landmark,
    report.contact.name,
    report.contact.phone,
    report.contact.email ?? "",
    report.assignedOfficeName,
    ...report.updates.flatMap((update) => [update.title, update.note, update.actorName, update.actorRole]),
  ]
    .join(" ")
    .toLowerCase()
}

function buildExportRows(reports: AdminReport[], includeCitizenFields: boolean) {
  return [
    [
      "Tracking number",
      "Type",
      "Category",
      "Status",
      "Severity",
      "LGA",
      "Ward",
      "Area",
      "Assigned office",
      "Moderation flag",
      "Escalations",
      "SLA",
      "Citizen name",
      "Phone",
      "Email",
      "Created at",
      "Updated at",
    ],
    ...reports.map((report) => [
      report.trackingNumber,
      report.kind,
      report.category,
      report.status,
      report.severity,
      report.location.lga,
      report.location.ward,
      report.location.area,
      report.assignedOfficeName,
      report.moderationFlag,
      String(report.escalationCount),
      report.slaState,
      includeCitizenFields ? report.contact.name : "Masked",
      includeCitizenFields ? report.contact.phone : "Masked",
      includeCitizenFields ? report.contact.email ?? "" : "Masked",
      report.createdAt,
      report.latestAuditAt,
    ]),
  ]
}

function buildExcelReadyRows(reports: AdminReport[], includeCitizenFields: boolean) {
  return [
    [
      "Tracking number",
      "Issue title",
      "Issue description",
      "Category",
      "Current status",
      "Severity",
      "Assigned office",
      "LGA",
      "Ward",
      "Community",
      "Area",
      "Moderation flag",
      "Duplicate of",
      "Escalation count",
      "Public notes",
      "Internal notes",
      "Citizen name",
      "Phone",
      "Email",
      "Submitted at",
      "Last updated at",
    ],
    ...reports.map((report) => [
      report.trackingNumber,
      report.title,
      report.description,
      report.category,
      report.status,
      report.severity,
      report.assignedOfficeName,
      report.location.lga,
      report.location.ward,
      report.location.community,
      report.location.area,
      report.moderationFlag,
      report.duplicateOf ?? "",
      String(report.escalationCount),
      report.updates.filter((update) => update.visibility === "public").map((update) => update.note).join(" | "),
      report.updates.filter((update) => update.visibility === "internal").map((update) => update.note).join(" | "),
      includeCitizenFields ? report.contact.name : "Masked",
      includeCitizenFields ? report.contact.phone : "Masked",
      includeCitizenFields ? report.contact.email ?? "" : "Masked",
      report.createdAt,
      report.latestAuditAt,
    ]),
  ]
}

function createDefaultOverride(): AdminOverride {
  return {
    moderationFlag: "none",
    auditTrail: [],
  }
}

export function AdminDashboard() {
  const { reports, hydrated } = useReportCenter()
  const [session, setSession] = useState<AdminSession | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [workspaceState, setWorkspaceState] = useState<Record<string, AdminOverride>>({})
  const [workspaceReady, setWorkspaceReady] = useState(false)
  const [filters, setFilters] = useState<AdminFilterState>(defaultAdminFilters)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [assignmentTarget, setAssignmentTarget] = useState<{
    reportId: string
    mode: "assign" | "reassign"
  } | null>(null)
  const [lightboxMedia, setLightboxMedia] = useState<ReportMedia | null>(null)
  const [sortKey, setSortKey] = useState<AdminSortKey>("latestAuditAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const deferredSearch = useDeferredValue(filters.search)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      const storedSession = window.sessionStorage.getItem(ADMIN_SESSION_KEY)

      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession) as AdminSession
          setSession(parsedSession)
          setFilters(
            parsedSession.role === "government_handler" && parsedSession.officeId
              ? { ...defaultAdminFilters, office: parsedSession.officeId }
              : defaultAdminFilters
          )
        } catch {
          window.sessionStorage.removeItem(ADMIN_SESSION_KEY)
        }
      }

      setSessionReady(true)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      const storedWorkspace = window.localStorage.getItem(ADMIN_WORKSPACE_KEY)

      if (storedWorkspace) {
        try {
          setWorkspaceState(JSON.parse(storedWorkspace) as Record<string, AdminOverride>)
        } catch {
          window.localStorage.removeItem(ADMIN_WORKSPACE_KEY)
        }
      }

      setWorkspaceReady(true)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    if (!sessionReady || typeof window === "undefined") {
      return
    }

    if (session) {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
      return
    }

    window.sessionStorage.removeItem(ADMIN_SESSION_KEY)
  }, [session, sessionReady])

  useEffect(() => {
    if (!workspaceReady || typeof window === "undefined") {
      return
    }

    window.localStorage.setItem(ADMIN_WORKSPACE_KEY, JSON.stringify(workspaceState))
  }, [workspaceReady, workspaceState])

  const permissions = session ? getRolePermissions(session.role) : getRolePermissions("viewer_analyst")

  const adminReports = useMemo(
    () => reports.map((report) => buildAdminReport(report, workspaceState[report.id])),
    [reports, workspaceState]
  )

  const scopedReports = useMemo(() => {
    if (!session) {
      return []
    }

    if (session.role === "government_handler" && session.officeId) {
      return adminReports.filter((report) => report.assignedOfficeId === session.officeId)
    }

    return adminReports
  }, [adminReports, session])

  const officeFilterValue =
    session?.role === "government_handler" && session.officeId ? session.officeId : filters.office

  const lgaOptions = useMemo(
    () => Array.from(new Set(scopedReports.map((report) => report.location.lga))).toSorted(),
    [scopedReports]
  )

  const wardOptions = useMemo(() => {
    const base = filters.lga === "all"
      ? scopedReports
      : scopedReports.filter((report) => report.location.lga === filters.lga)

    return Array.from(new Set(base.map((report) => report.location.ward))).toSorted()
  }, [filters.lga, scopedReports])

  const filteredReports = useMemo(() => {
    const searchTerm = deferredSearch.trim().toLowerCase()

    const base = scopedReports
      .filter((report) => {
        const matchesSearch =
          searchTerm.length === 0 ? true : buildSearchableText(report).includes(searchTerm)
        const matchesStatus = filters.status === "all" ? true : report.status === filters.status
        const matchesCategory = filters.category === "all" ? true : report.category === filters.category
        const matchesLga = filters.lga === "all" ? true : report.location.lga === filters.lga
        const matchesWard = filters.ward === "all" ? true : report.location.ward === filters.ward
        const matchesOffice = officeFilterValue === "all" ? true : report.assignedOfficeId === officeFilterValue
        const matchesSeverity = filters.severity === "all" ? true : report.severity === filters.severity
        const submittedDay = report.createdAt.slice(0, 10)
        const matchesFromDate = filters.fromDate ? submittedDay >= filters.fromDate : true
        const matchesToDate = filters.toDate ? submittedDay <= filters.toDate : true

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCategory &&
          matchesLga &&
          matchesWard &&
          matchesOffice &&
          matchesSeverity &&
          matchesFromDate &&
          matchesToDate
        )
      })

    return base.toSorted((left, right) => {
      const direction = sortDirection === "asc" ? 1 : -1

      switch (sortKey) {
        case "createdAt":
          return (Date.parse(left.createdAt) - Date.parse(right.createdAt)) * direction
        case "trackingNumber":
          return left.trackingNumber.localeCompare(right.trackingNumber) * direction
        case "category":
          return left.category.localeCompare(right.category) * direction
        case "title":
          return left.title.localeCompare(right.title) * direction
        case "location":
          return (
            `${left.location.lga} ${left.location.ward} ${left.location.area}`.localeCompare(
              `${right.location.lga} ${right.location.ward} ${right.location.area}`
            ) * direction
          )
        case "assignedOfficeName":
          return left.assignedOfficeName.localeCompare(right.assignedOfficeName) * direction
        case "status":
          return ((statusRank[left.status] ?? 0) - (statusRank[right.status] ?? 0)) * direction
        case "severity":
          return (
            (severityRank[left.severity] ?? 0) - (severityRank[right.severity] ?? 0)
          ) * direction
        case "latestAuditAt":
        default:
          return (Date.parse(left.latestAuditAt) - Date.parse(right.latestAuditAt)) * direction
      }
    })
  }, [
    deferredSearch,
    filters.category,
    filters.fromDate,
    filters.lga,
    filters.severity,
    filters.status,
    filters.toDate,
    filters.ward,
    officeFilterValue,
    scopedReports,
    sortDirection,
    sortKey,
  ])

  const selectedReport =
    filteredReports.find((report) => report.id === selectedReportId) ??
    scopedReports.find((report) => report.id === selectedReportId) ??
    null

  const newQueueReports = useMemo(
    () =>
      scopedReports
        .filter((report) => report.status === "Received" || report.status === "Under Review")
        .toSorted((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
        .slice(0, 6),
    [scopedReports]
  )

  const summaryStrip = useMemo(() => {
    const openReports = scopedReports.filter(
      (report) => !["Resolved", "Closed", "Rejected"].includes(report.status)
    )
    const overdueReports = scopedReports.filter((report) => report.slaState === "overdue")
    const categoryCounts = scopedReports.reduce<Record<string, number>>((accumulator, report) => {
      accumulator[report.category] = (accumulator[report.category] ?? 0) + 1
      return accumulator
    }, {})
    const lgaCounts = scopedReports.reduce<Record<string, number>>((accumulator, report) => {
      accumulator[report.location.lga] = (accumulator[report.location.lga] ?? 0) + 1
      return accumulator
    }, {})
    const topIssue = Object.entries(categoryCounts).toSorted((left, right) => right[1] - left[1])[0]
    const hottestLga = Object.entries(lgaCounts).toSorted((left, right) => right[1] - left[1])[0]

    return [
      {
        label: "Visible reports",
        value: String(scopedReports.length),
      },
      {
        label: "Open reports",
        value: String(openReports.length),
      },
      {
        label: "Overdue",
        value: String(overdueReports.length),
      },
      {
        label: "Top issue",
        value: topIssue?.[0] ?? "None",
      },
      {
        label: "Hottest LGA",
        value: hottestLga?.[0] ?? "None",
      },
    ]
  }, [scopedReports])

  function handleSortChange(nextKey: string) {
    setSortKey((currentKey) => {
      const typedKey = nextKey as AdminSortKey

      if (currentKey === typedKey) {
        setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"))
        return currentKey
      }

      setSortDirection(
        typedKey === "latestAuditAt" || typedKey === "createdAt" ? "desc" : "asc"
      )
      return typedKey
    })
  }

  function updateWorkspace(reportId: string, updater: (current: AdminOverride) => AdminOverride) {
    setWorkspaceState((currentState) => {
      const current = currentState[reportId] ?? createDefaultOverride()
      return {
        ...currentState,
        [reportId]: updater(current),
      }
    })
  }

  function getCurrentReport(reportId: string) {
    return adminReports.find((report) => report.id === reportId)
  }

  function pushAuditUpdate(reportId: string, next: {
    patch?: Partial<AdminOverride>
    status?: ReportStatus
    title: string
    note: string
    visibility: "public" | "internal"
    isEscalation?: boolean
  }) {
    const currentReport = getCurrentReport(reportId)

    if (!currentReport || !session) {
      return
    }

    updateWorkspace(reportId, (current) => ({
      ...current,
      ...next.patch,
      auditTrail: [
        ...current.auditTrail,
        createAuditUpdate({
          title: next.title,
          note: next.note,
          status: next.status ?? (next.patch?.status as ReportStatus | undefined) ?? currentReport.status,
          visibility: next.visibility,
          actorName: session.name,
          actorRole: roleLabel(session.role),
          isEscalation: next.isEscalation,
        }),
      ],
    }))
  }

  function handleAssignmentConfirm(input: {
    officeId: string
    note: string
    sharePublicly: boolean
  }) {
    if (!assignmentTarget) {
      return
    }

    const report = getCurrentReport(assignmentTarget.reportId)

    if (!report) {
      return
    }

    const office = getOfficeById(input.officeId)
    const nextStatus =
      report.status === "Received" || report.status === "Under Review" ? "Assigned" : report.status

    pushAuditUpdate(report.id, {
      patch: {
        assignedOfficeId: input.officeId,
        status: nextStatus,
      },
      status: nextStatus,
      title: assignmentTarget.mode === "assign" ? "Assigned to office" : "Reassigned to office",
      note:
        input.note ||
        `${report.trackingNumber} is now owned by ${office.name} for the next operational action.`,
      visibility: input.sharePublicly ? "public" : "internal",
    })

    setAssignmentTarget(null)
    toast.success(`Ticket moved to ${office.name}.`)
  }

  function handleChangeStatus(
    reportId: string,
    status: ReportStatus,
    note: string,
    visibility: "public" | "internal"
  ) {
    pushAuditUpdate(reportId, {
      patch: { status },
      status,
      title: `Status changed to ${status}`,
      note,
      visibility,
    })

    toast.success(`Status updated to ${status}.`)
  }

  function handleEscalate(reportId: string, note: string) {
    pushAuditUpdate(reportId, {
      title: "Escalated for intervention",
      note,
      visibility: "public",
      isEscalation: true,
    })

    toast.success("Ticket escalated and logged in the audit trail.")
  }

  function handleReject(reportId: string, note: string) {
    updateWorkspace(reportId, (current) => ({
      ...current,
      status: "Rejected",
      moderationFlag: current.moderationFlag === "none" ? "review" : current.moderationFlag,
      auditTrail: [
        ...current.auditTrail,
        createAuditUpdate({
          title: "Submission rejected",
          note,
          status: "Rejected",
          visibility: "public",
          actorName: session?.name ?? "Operator",
          actorRole: session ? roleLabel(session.role) : "Operator",
        }),
      ],
    }))

    toast.success("Ticket rejected.")
  }

  function handleMarkDuplicate(reportId: string, duplicateOf: string, note: string) {
    updateWorkspace(reportId, (current) => ({
      ...current,
      status: "Rejected",
      moderationFlag: "duplicate",
      duplicateOf,
      auditTrail: [
        ...current.auditTrail,
        createAuditUpdate({
          title: "Marked as duplicate",
          note,
          status: "Rejected",
          visibility: "public",
          actorName: session?.name ?? "Operator",
          actorRole: session ? roleLabel(session.role) : "Operator",
        }),
      ],
    }))

    toast.success("Duplicate marker applied.")
  }

  function handleResolve(reportId: string, note: string) {
    pushAuditUpdate(reportId, {
      patch: { status: "Resolved" },
      status: "Resolved",
      title: "Marked resolved",
      note,
      visibility: "public",
    })

    toast.success("Ticket marked resolved.")
  }

  function handleAddNote(reportId: string, kind: "internal" | "public", body: string) {
    if (!body.trim()) {
      return
    }

    const currentReport = getCurrentReport(reportId)

    if (!currentReport) {
      return
    }

    pushAuditUpdate(reportId, {
      title: kind === "internal" ? "Internal note added" : "Public note posted",
      note: body,
      status: currentReport.status,
      visibility: kind,
    })

    toast.success(kind === "internal" ? "Internal note saved." : "Public note saved.")
  }

  function handleSetModerationFlag(reportId: string, flag: ModerationFlag) {
    updateWorkspace(reportId, (current) => ({
      ...current,
      moderationFlag: flag,
      auditTrail:
        current.moderationFlag === flag
          ? current.auditTrail
          : [
              ...current.auditTrail,
              createAuditUpdate({
                title: "Moderation flag updated",
                note: `Flag changed to ${flag === "none" ? "no flag" : flag}.`,
                status: getCurrentReport(reportId)?.status ?? "Under Review",
                visibility: "internal",
                actorName: session?.name ?? "Operator",
                actorRole: session ? roleLabel(session.role) : "Operator",
              }),
            ],
    }))

    toast.success("Moderation flag updated.")
  }

  function exportCsvReport() {
    downloadCsv(
      "ekisignal-admin-export.csv",
      buildExportRows(filteredReports, permissions.viewCitizen)
    )
    toast.success("CSV export prepared.")
  }

  function exportExcelReadyReport() {
    downloadCsv(
      "ekisignal-admin-excel-ready.csv",
      buildExcelReadyRows(filteredReports, permissions.viewCitizen)
    )
    toast.success("Spreadsheet-ready export prepared.")
  }

  if (!hydrated || !sessionReady || !workspaceReady) {
    return <AdminLoadingShell />
  }

  if (!session) {
    return (
      <AdminLoginScreen
        onLogin={(nextSession) => {
          setSession(nextSession)
          setFilters(
            nextSession.role === "government_handler" && nextSession.officeId
              ? { ...defaultAdminFilters, office: nextSession.officeId ?? "all" }
              : defaultAdminFilters
          )
          toast.success(`${roleLabel(nextSession.role)} session opened.`)
        }}
      />
    )
  }

  const queueAllowed = session.role !== "viewer_analyst"

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,92,67,0.09),transparent_28%),radial-gradient(circle_at_top_right,rgba(214,176,66,0.12),transparent_22%),linear-gradient(180deg,#f4f7f2,#edf3ee)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <header className="surface-panel rounded-[1.9rem] px-5 py-5 shadow-soft sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
                EkiSignal Admin
              </p>
              <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Operational queue and report workbench
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                Search, filter, sort, and open a row without losing the queue. The workbench stays
                beside the table so routing, moderation, and audit actions feel continuous.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <RoleBadge role={session.role} />
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-[1.2rem]"
                )}
              >
                <House data-icon="inline-start" />
                Citizen app
              </Link>
              {permissions.export ? (
                <>
                  <button
                    type="button"
                    onClick={exportCsvReport}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "rounded-[1.2rem]"
                    )}
                  >
                    <Download data-icon="inline-start" />
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportExcelReadyReport}
                    className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
                  >
                    <FileSpreadsheet data-icon="inline-start" />
                    Excel-ready
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSession(null)
                  setFilters(defaultAdminFilters)
                  setSelectedReportId(null)
                  toast.success("Signed out of admin session.")
                }}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-[1.2rem]")}
              >
                <LogOut data-icon="inline-start" />
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {summaryStrip.map((item) => (
              <div
                key={item.label}
                className="rounded-full border border-white/60 bg-white/78 px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
              >
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              Scope:{" "}
              <span className="font-medium text-foreground">
                {session.role === "government_handler" && session.officeId
                  ? getOfficeById(session.officeId).name
                  : "Statewide operations"}
              </span>
            </span>
            <span className="text-border">•</span>
            <span>
              Permissions:{" "}
              <span className="font-medium text-foreground">
                {permissions.changeStatus ? "Operational edits enabled" : "Read-only surface"}
              </span>
            </span>
          </div>
        </header>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
          <div className="min-w-0 space-y-4">
        {queueAllowed ? (
          <section className="surface-panel rounded-[1.7rem] p-4 shadow-soft sm:p-4.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
                  New queue
                </p>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  Fresh intake waiting for screening, assignment, or first response.
                </p>
              </div>
              <span className="section-chip rounded-full px-3 py-1.5 text-[0.72rem] font-semibold text-primary">
                {newQueueReports.length} queue row{newQueueReports.length === 1 ? "" : "s"}
              </span>
            </div>

            {newQueueReports.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/60">
                {newQueueReports.map((report, index) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReportId(report.id)}
                    className={cn(
                      "interactive-press flex w-full items-start justify-between gap-4 bg-white/88 px-4 py-4 text-left",
                      index !== 0 && "border-t border-white/60"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <SlaBadge state={report.slaState} />
                        <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {report.status}
                        </span>
                        <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {report.severity}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground">{report.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {report.trackingNumber} • {report.location.area || report.location.community},{" "}
                        {report.location.lga}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <p>{format(new Date(report.createdAt), "dd MMM")}</p>
                      <p className="mt-1 inline-flex items-center gap-1">
                        <ArrowUpRight className="size-3.5" />
                        Open
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.45rem] border border-dashed border-primary/16 bg-primary/[0.04] px-4 py-5 text-sm leading-6 text-muted-foreground">
                No fresh queue items in this role scope right now.
              </div>
            )}
          </section>
        ) : null}

        <section id="reports" className="min-w-0 space-y-4">
          <AdminFilterBar
            filters={filters}
            options={{
              lgas: lgaOptions,
              wards: wardOptions,
              offices: offices.map((office) => ({ id: office.id, name: office.name })),
            }}
            resultCount={filteredReports.length}
            officeLocked={session.role === "government_handler" && Boolean(session.officeId)}
            onChange={(key, value) =>
              setFilters((current) => ({
                ...current,
                [key]: value,
              }))
            }
            onReset={() =>
              setFilters(
                session.role === "government_handler" && session.officeId
                  ? { ...defaultAdminFilters, office: session.officeId }
                  : defaultAdminFilters
              )
            }
          />

          <AdminSmartTable
            reports={filteredReports}
            selectedReportId={selectedReportId}
            onSelectReport={setSelectedReportId}
            canViewCitizen={permissions.viewCitizen}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        </section>
          </div>

          <div className="min-w-0 xl:min-w-[23rem]">
            <AdminReportWorkbenchPanel
              report={selectedReport}
              session={session}
              permissions={permissions}
              onOpenAssignment={(mode, report) => setAssignmentTarget({ reportId: report.id, mode })}
              onChangeStatus={handleChangeStatus}
              onEscalate={handleEscalate}
              onReject={handleReject}
              onMarkDuplicate={handleMarkDuplicate}
              onResolve={handleResolve}
              onAddNote={handleAddNote}
              onSetModerationFlag={handleSetModerationFlag}
              onOpenMedia={setLightboxMedia}
            />
          </div>
        </div>
      </div>

      <AdminAssignmentModal
        open={Boolean(assignmentTarget)}
        mode={assignmentTarget?.mode ?? "assign"}
        currentOfficeId={
          assignmentTarget
            ? getCurrentReport(assignmentTarget.reportId)?.assignedOfficeId
            : undefined
        }
        reportTitle={
          assignmentTarget ? getCurrentReport(assignmentTarget.reportId)?.title : undefined
        }
        offices={offices.map((office) => ({ id: office.id, name: office.name }))}
        onClose={() => setAssignmentTarget(null)}
        onConfirm={handleAssignmentConfirm}
      />

      <AdminMediaLightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />
    </div>
  )
}

function AdminLoadingShell() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f7f2,#edf3ee)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Skeleton className="h-34 rounded-[1.9rem]" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.75fr)]">
          <div className="space-y-4">
            <Skeleton className="h-56 rounded-[1.7rem]" />
            <Skeleton className="h-[38rem] rounded-[1.75rem]" />
          </div>
          <Skeleton className="h-[52rem] rounded-[1.8rem]" />
        </div>
      </div>
    </div>
  )
}
