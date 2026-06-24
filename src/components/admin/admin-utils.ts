import { addHours, differenceInHours, isAfter } from "date-fns"

import { getOfficeById } from "@/lib/routing"
import type { ReportRecord, ReportSeverity, ReportStatus, ReportUpdate } from "@/lib/types"

export const adminRoles = [
  {
    id: "super_admin",
    label: "Super Admin",
    helper: "Full control across moderation, assignment, exports, and analytics.",
  },
  {
    id: "moderator",
    label: "Moderator",
    helper: "Screens reports, manages flags, adds notes, and routes tickets.",
  },
  {
    id: "government_handler",
    label: "Government Handler",
    helper: "Works assigned operational tickets and updates live progress.",
  },
  {
    id: "viewer_analyst",
    label: "Viewer / Analyst",
    helper: "Read-only analytics, exports, and operational visibility.",
  },
] as const

export const moderationFlags = ["none", "review", "sensitive", "abusive", "duplicate"] as const

export type AdminRoleId = (typeof adminRoles)[number]["id"]
export type ModerationFlag = (typeof moderationFlags)[number]
export type SlaState = "on-track" | "due-soon" | "overdue" | "completed"

export interface AdminSession {
  email: string
  role: AdminRoleId
  name: string
  officeId?: string
}

export interface AdminFilterState {
  search: string
  status: string
  category: string
  lga: string
  ward: string
  office: string
  severity: string
  fromDate: string
  toDate: string
}

export interface AdminOverride {
  status?: ReportStatus
  assignedOfficeId?: string
  moderationFlag?: ModerationFlag
  duplicateOf?: string
  auditTrail: ReportUpdate[]
}

export interface AdminReport extends ReportRecord {
  dueAt: string
  latestAuditAt: string
  moderationFlag: ModerationFlag
  duplicateOf?: string
  escalationCount: number
  slaState: SlaState
}

export interface RolePermissions {
  assign: boolean
  moderate: boolean
  changeStatus: boolean
  resolve: boolean
  export: boolean
  viewCitizen: boolean
  addInternalNotes: boolean
  addPublicNotes: boolean
}

const severityHours: Record<ReportSeverity, number> = {
  routine: 48,
  urgent: 12,
  critical: 2,
}

export const defaultAdminFilters: AdminFilterState = {
  search: "",
  status: "all",
  category: "all",
  lga: "all",
  ward: "all",
  office: "all",
  severity: "all",
  fromDate: "",
  toDate: "",
}

export function roleLabel(role: AdminRoleId) {
  return adminRoles.find((item) => item.id === role)?.label ?? "Operator"
}

export function getRolePermissions(role: AdminRoleId): RolePermissions {
  switch (role) {
    case "super_admin":
      return {
        assign: true,
        moderate: true,
        changeStatus: true,
        resolve: true,
        export: true,
        viewCitizen: true,
        addInternalNotes: true,
        addPublicNotes: true,
      }
    case "moderator":
      return {
        assign: true,
        moderate: true,
        changeStatus: true,
        resolve: true,
        export: true,
        viewCitizen: true,
        addInternalNotes: true,
        addPublicNotes: true,
      }
    case "government_handler":
      return {
        assign: true,
        moderate: false,
        changeStatus: true,
        resolve: true,
        export: false,
        viewCitizen: true,
        addInternalNotes: true,
        addPublicNotes: true,
      }
    case "viewer_analyst":
      return {
        assign: false,
        moderate: false,
        changeStatus: false,
        resolve: false,
        export: true,
        viewCitizen: false,
        addInternalNotes: false,
        addPublicNotes: false,
      }
  }
}

export function getDueAt(report: Pick<ReportRecord, "createdAt" | "severity">) {
  return addHours(new Date(report.createdAt), severityHours[report.severity]).toISOString()
}

export function getSlaState(report: Pick<ReportRecord, "createdAt" | "severity" | "status">): SlaState {
  if (["Resolved", "Closed", "Rejected"].includes(report.status)) {
    return "completed"
  }

  const dueAt = addHours(new Date(report.createdAt), severityHours[report.severity])
  const now = new Date()

  if (isAfter(now, dueAt)) {
    return "overdue"
  }

  const hoursRemaining = differenceInHours(dueAt, now)
  const dueSoonThreshold = report.severity === "critical" ? 1 : report.severity === "urgent" ? 4 : 12

  if (hoursRemaining <= dueSoonThreshold) {
    return "due-soon"
  }

  return "on-track"
}

export function buildAdminReport(
  report: ReportRecord,
  override: AdminOverride | undefined
): AdminReport {
  const mergedUpdates = [...report.updates, ...(override?.auditTrail ?? [])].toSorted(
    (left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)
  )
  const assignedOfficeId = override?.assignedOfficeId ?? report.assignedOfficeId
  const latestAuditAt = mergedUpdates.at(-1)?.createdAt ?? report.updatedAt
  const status = override?.status ?? report.status

  return {
    ...report,
    status,
    updates: mergedUpdates,
    assignedOfficeId,
    assignedOfficeName: getOfficeById(assignedOfficeId).name,
    updatedAt: latestAuditAt,
    latestAuditAt,
    dueAt: getDueAt(report),
    moderationFlag: override?.moderationFlag ?? "none",
    duplicateOf: override?.duplicateOf,
    escalationCount: mergedUpdates.filter((update) => update.isEscalation).length,
    slaState: getSlaState({
      createdAt: report.createdAt,
      severity: report.severity,
      status,
    }),
  }
}

export function createAuditUpdate(input: {
  title: string
  note: string
  status: ReportStatus
  actorName: string
  actorRole: string
  visibility: "public" | "internal"
  isEscalation?: boolean
}) {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    note: input.note,
    status: input.status,
    actorName: input.actorName,
    actorRole: input.actorRole,
    visibility: input.visibility,
    isEscalation: input.isEscalation,
    createdAt: new Date().toISOString(),
  } satisfies ReportUpdate
}

export function maskPhone(value: string) {
  if (value.length < 6) {
    return "Hidden"
  }

  return `${value.slice(0, 4)} ••• ${value.slice(-2)}`
}

export function maskEmail(value?: string) {
  if (!value) {
    return "Not provided"
  }

  const [localPart, domain = ""] = value.split("@")

  if (!localPart) {
    return "Hidden"
  }

  return `${localPart.slice(0, 2)}•••@${domain}`
}

export function createDisplayName(email: string) {
  const localPart = email.split("@")[0] ?? "operator"
  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}
