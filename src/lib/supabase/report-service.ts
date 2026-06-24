import "server-only"

import { z } from "zod"

import { ekitiState } from "@/lib/ekiti"
import { getEstimatedResponse } from "@/lib/routing"
import type {
  Database,
  DbMediaKind,
  DbNotificationChannel,
  DbNotificationKind,
  DbReportStatus,
  Json,
} from "@/lib/supabase/database.types"
import {
  createServiceRoleSupabaseClient,
  type ServiceSupabaseClient,
} from "@/lib/supabase/server"
import type { ReportKind, ReportSeverity } from "@/lib/types"

type TypedSupabaseClient = ServiceSupabaseClient
type Tables = Database["public"]["Tables"]
type ReportRow = Tables["reports"]["Row"]
type OfficeRow = Tables["offices"]["Row"]
type RoutingRuleRow = Tables["routing_rules"]["Row"]
type AssignmentRow = Tables["assignments"]["Row"]
type LocationRow = Tables["locations"]["Row"]
type CategoryRow = Tables["categories"]["Row"]
type ReportTypeRow = Tables["report_types"]["Row"]
type HandlerRow = Tables["handlers"]["Row"]
type LgaRow = Tables["lgas"]["Row"]
type WardRow = Tables["wards"]["Row"]

const submissionInputSchema = z
  .object({
    reportTypeCode: z.enum(["report", "complaint", "suggestion"] satisfies readonly ReportKind[]),
    category: z.string().trim().min(1),
    severity: z.enum(["routine", "urgent", "critical"] satisfies readonly ReportSeverity[]),
    title: z.string().trim().min(4).max(180),
    description: z.string().trim().min(12).max(4000),
    landmarkNote: z.string().trim().max(240).optional().nullable(),
    isAnonymous: z.boolean().default(false),
    submittedByUserId: z.string().uuid().optional().nullable(),
    sourceChannel: z.string().trim().min(2).default("web"),
    metadata: z.custom<Json>().optional(),
    location: z.object({
      stateName: z.string().trim().default(ekitiState),
      lga: z.string().trim().min(1),
      ward: z.string().trim().optional().nullable(),
      community: z.string().trim().optional().nullable(),
      area: z.string().trim().optional().nullable(),
      streetAddress: z.string().trim().optional().nullable(),
      landmark: z.string().trim().optional().nullable(),
      latitude: z.number().finite().optional().nullable(),
      longitude: z.number().finite().optional().nullable(),
      metadata: z.custom<Json>().optional(),
    }),
    contactName: z.string().trim().optional().nullable(),
    contactPhone: z.string().trim().optional().nullable(),
    contactEmail: z.string().trim().email().optional().or(z.literal("")).nullable(),
  })
  .superRefine((value, ctx) => {
    if (!value.isAnonymous && !value.contactName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Contact name is required for identified submissions.",
        path: ["contactName"],
      })
    }

    if (!value.isAnonymous && !value.contactPhone?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required for identified submissions.",
        path: ["contactPhone"],
      })
    }
  })

export interface ReportMediaUploadInput {
  fileName: string
  kind: DbMediaKind
  mimeType?: string | null
  fileSizeBytes?: number | null
  bytes?: ArrayBuffer | Uint8Array
  storagePath?: string
  metadata?: Json
}

export interface SubmitCitizenReportInput
  extends z.infer<typeof submissionInputSchema> {
  media?: ReportMediaUploadInput[]
}

export interface RouteReportInput {
  categoryId: string
  lgaId: string
  wardId?: string | null
}

export interface RouteReportResult {
  office: OfficeRow
  rule: RoutingRuleRow | null
  isFallback: boolean
  reason: string
  score: number
}

export interface AssignReportInput {
  reportId: string
  officeId: string
  actorUserId?: string | null
  actorName?: string
  actorRole?: string
  assignmentMode?: Database["public"]["Enums"]["assignment_mode"]
  routingRuleId?: string | null
  handlerId?: string | null
  note?: string | null
  status?: DbReportStatus
  escalated?: boolean
  visibility?: Database["public"]["Enums"]["update_visibility"]
}

export interface UpdateReportStatusInput {
  reportId: string
  status: DbReportStatus
  actorUserId?: string | null
  actorName?: string
  actorRole?: string
  title?: string
  note: string
  visibility?: Database["public"]["Enums"]["update_visibility"]
  force?: boolean
  metadata?: Json
}

export interface LogAuditEventInput {
  reportId?: string | null
  actorUserId?: string | null
  entityType: string
  entityId?: string | null
  action: string
  actorRoleSnapshot?: string | null
  payload?: Json
}

export interface NotifyCitizenInput {
  reportId: string
  submittedByUserId?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  title: string
  body: string
  kind?: DbNotificationKind
  channels?: DbNotificationChannel[]
  metadata?: Json
}

export interface NotifyOfficeInput {
  reportId: string
  officeId: string
  title: string
  body: string
  kind?: DbNotificationKind
  channels?: DbNotificationChannel[]
  metadata?: Json
}

export interface SubmitCitizenReportResult {
  report: ReportRow
  assignment: AssignmentRow
  routing: RouteReportResult
  trackingNumber: string
}

export class EkiSignalBackendError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = "EkiSignalBackendError"
  }
}

const allowedTransitions: Record<DbReportStatus, DbReportStatus[]> = {
  Received: ["Under Review", "Assigned", "Rejected"],
  "Under Review": ["Assigned", "Rejected", "Closed"],
  Assigned: ["In Progress", "Resolved", "Rejected", "Closed"],
  "In Progress": ["Resolved", "Rejected", "Closed"],
  Resolved: ["Closed", "In Progress"],
  Closed: [],
  Rejected: [],
}

function normalizeKey(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function mutationPayload<T>(value: T) {
  return value as never
}

function getClient(client?: TypedSupabaseClient | null) {
  const resolvedClient = client ?? createServiceRoleSupabaseClient()

  if (!resolvedClient) {
    throw new EkiSignalBackendError(
      "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY."
    )
  }

  return resolvedClient as TypedSupabaseClient
}

async function requireSingle<T>(
  promise: PromiseLike<{ data: T | null; error: unknown }>,
  message: string
) {
  const { data, error } = await promise

  if (error || !data) {
    throw new EkiSignalBackendError(message, { cause: error })
  }

  return data
}

async function fetchReportType(
  client: TypedSupabaseClient,
  code: string
) {
  const { data, error } = await client.from("report_types").select("*")

  if (error || !data) {
    throw new EkiSignalBackendError("Unable to load report types.", { cause: error })
  }

  const rows = (data ?? []) as ReportTypeRow[]
  const target = rows.find(
    (item) => item.code === code || normalizeKey(item.label) === normalizeKey(code)
  )

  if (!target) {
    throw new EkiSignalBackendError(`Unknown report type "${code}".`)
  }

  return target
}

async function fetchCategory(
  client: TypedSupabaseClient,
  category: string
) {
  const { data, error } = await client.from("categories").select("*")

  if (error || !data) {
    throw new EkiSignalBackendError("Unable to load categories.", { cause: error })
  }

  const rows = (data ?? []) as CategoryRow[]
  const target = rows.find(
    (item) =>
      item.slug === normalizeKey(category) ||
      normalizeKey(item.name) === normalizeKey(category)
  )

  if (!target) {
    throw new EkiSignalBackendError(`Unknown report category "${category}".`)
  }

  return target
}

async function resolveLocationLookup(
  client: TypedSupabaseClient,
  input: SubmitCitizenReportInput["location"]
) {
  const [{ data: lgas, error: lgaError }, { data: wards, error: wardError }] =
    await Promise.all([
      client.from("lgas").select("*"),
      client.from("wards").select("*"),
    ])

  if (lgaError || !lgas) {
    throw new EkiSignalBackendError("Unable to load LGAs for location resolution.", {
      cause: lgaError,
    })
  }

  if (wardError || !wards) {
    throw new EkiSignalBackendError("Unable to load wards for location resolution.", {
      cause: wardError,
    })
  }

  const lgaRows = (lgas ?? []) as LgaRow[]
  const wardRows = (wards ?? []) as WardRow[]
  const matchedLga = lgaRows.find(
    (item) =>
      item.slug === normalizeKey(input.lga) ||
      normalizeKey(item.name) === normalizeKey(input.lga)
  )

  if (!matchedLga) {
    throw new EkiSignalBackendError(`Unknown LGA "${input.lga}".`)
  }

  const matchedWard =
    input.ward?.trim()
      ? wardRows.find(
          (item) =>
            item.lga_id === matchedLga.id &&
            (item.slug === `${matchedLga.slug}-${normalizeKey(input.ward)}` ||
              normalizeKey(item.name) === normalizeKey(input.ward))
        ) ?? null
      : null

  return {
    lga: matchedLga,
    ward: matchedWard,
  }
}

function scoreRoutingRule(
  rule: RoutingRuleRow,
  input: RouteReportInput
) {
  let score = rule.priority

  if (!rule.is_active) {
    return -1
  }

  if (rule.category_id && rule.category_id !== input.categoryId) {
    return -1
  }

  if (rule.lga_id) {
    if (rule.lga_id !== input.lgaId) {
      return -1
    }
    score += 30
  }

  if (rule.ward_id) {
    if (rule.ward_id !== input.wardId) {
      return -1
    }
    score += 20
  }

  if (rule.is_fallback) {
    score -= 1000
  }

  return score
}

async function fetchReportById(client: TypedSupabaseClient, reportId: string) {
  return requireSingle<ReportRow>(
    client.from("reports").select("*").eq("id", reportId).single() as PromiseLike<{
      data: ReportRow | null
      error: unknown
    }>,
    `Report ${reportId} was not found.`
  )
}

async function fetchOfficeById(client: TypedSupabaseClient, officeId: string) {
  return requireSingle<OfficeRow>(
    client.from("offices").select("*").eq("id", officeId).single() as PromiseLike<{
      data: OfficeRow | null
      error: unknown
    }>,
    `Office ${officeId} was not found.`
  )
}

function createStoragePath(reportId: string, media: ReportMediaUploadInput) {
  const sanitizedName = media.fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${reportId}/${Date.now()}-${sanitizedName || "evidence"}`
}

async function persistReportMedia(
  client: TypedSupabaseClient,
  reportId: string,
  media: ReportMediaUploadInput[]
) {
  if (media.length === 0) {
    return []
  }

  const bucket = process.env.SUPABASE_REPORT_MEDIA_BUCKET || "report-media"
  const rows: Tables["report_media"]["Insert"][] = []

  for (const item of media) {
    const storagePath = item.storagePath ?? createStoragePath(reportId, item)

    if (item.bytes) {
      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(storagePath, item.bytes, {
          contentType: item.mimeType ?? undefined,
          upsert: false,
        })

      if (uploadError) {
        throw new EkiSignalBackendError(`Unable to upload media ${item.fileName}.`, {
          cause: uploadError,
        })
      }
    }

    rows.push({
      report_id: reportId,
      bucket_name: bucket,
      storage_path: storagePath,
      media_kind: item.kind,
      file_name: item.fileName,
      mime_type: item.mimeType ?? null,
      file_size_bytes: item.fileSizeBytes ?? null,
      metadata: item.metadata ?? {},
    })
  }

  const { data, error } = await client
    .from("report_media")
    .insert(mutationPayload(rows))
    .select("*")

  if (error || !data) {
    throw new EkiSignalBackendError("Unable to save report media metadata.", {
      cause: error,
    })
  }

  return (data ?? []) as Tables["report_media"]["Row"][]
}

export async function generateTrackingNumber(
  clientArg?: TypedSupabaseClient | null
) {
  const client = getClient(clientArg)
  const { data, error } = await client.rpc("generate_tracking_number")

  if (!error && data) {
    return data
  }

  const today = new Date().toISOString().slice(0, 10).replaceAll("-", "")
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `EKI-${today}-${suffix}`
}

export async function routeReport(
  input: RouteReportInput,
  clientArg?: TypedSupabaseClient | null
): Promise<RouteReportResult> {
  const client = getClient(clientArg)
  const [{ data: rules, error: ruleError }, { data: offices, error: officeError }] =
    await Promise.all([
      client.from("routing_rules").select("*"),
      client.from("offices").select("*").eq("is_active", true),
    ])

  if (ruleError || !rules) {
    throw new EkiSignalBackendError("Unable to load routing rules.", { cause: ruleError })
  }

  if (officeError || !offices) {
    throw new EkiSignalBackendError("Unable to load offices for routing.", {
      cause: officeError,
    })
  }

  const ruleRows = (rules ?? []) as RoutingRuleRow[]
  const officeRows = (offices ?? []) as OfficeRow[]
  const ranked = ruleRows
    .map((rule) => ({
      rule,
      score: scoreRoutingRule(rule, input),
    }))
    .filter((entry) => entry.score >= 0)
    .sort((left, right) => right.score - left.score)

  const matchedRule =
    ranked[0]?.rule ?? ruleRows.find((item) => item.is_active && item.is_fallback) ?? null
  const fallbackOffice =
    officeRows.find((item) => item.is_default_queue) ?? officeRows[0] ?? null
  const matchedOffice =
    officeRows.find((item) => item.id === matchedRule?.office_id) ?? fallbackOffice

  if (!matchedOffice) {
    throw new EkiSignalBackendError(
      "No office is available to receive this report. Seed the offices table before routing."
    )
  }

  return {
    office: matchedOffice,
    rule: matchedRule,
    isFallback: matchedRule?.is_fallback ?? true,
    reason:
      matchedRule && !matchedRule.is_fallback
        ? `Matched routing rule ${matchedRule.code}.`
        : `No specific rule matched. Sent to ${matchedOffice.name}.`,
    score: ranked[0]?.score ?? 0,
  }
}

export async function logAuditEvent(
  input: LogAuditEventInput,
  clientArg?: TypedSupabaseClient | null
) {
  const client = getClient(clientArg)
  const { data, error } = await client
    .from("audit_logs")
    .insert(mutationPayload({
      report_id: input.reportId ?? null,
      actor_user_id: input.actorUserId ?? null,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      action: input.action,
      actor_role_snapshot: input.actorRoleSnapshot ?? null,
      payload: input.payload ?? {},
    }))
    .select("*")
    .single()

  if (error || !data) {
    throw new EkiSignalBackendError("Unable to write audit log.", { cause: error })
  }

  return data as Tables["audit_logs"]["Row"]
}

export async function notifyCitizen(
  input: NotifyCitizenInput,
  clientArg?: TypedSupabaseClient | null
) {
  const client = getClient(clientArg)
  const requestedChannels = new Set(input.channels ?? ["in_app", "email"])
  const rows: Tables["notifications"]["Insert"][] = []

  if (input.submittedByUserId && requestedChannels.has("in_app")) {
    rows.push({
      report_id: input.reportId,
      recipient_user_id: input.submittedByUserId,
      kind: input.kind ?? "submission_confirmation",
      channel: "in_app",
      title: input.title,
      body: input.body,
      metadata: input.metadata ?? {},
    })
  }

  if (input.contactEmail && requestedChannels.has("email")) {
    rows.push({
      report_id: input.reportId,
      kind: input.kind ?? "submission_confirmation",
      channel: "email",
      title: input.title,
      body: input.body,
      recipient_email: input.contactEmail,
      metadata: input.metadata ?? {},
    })
  }

  if (input.contactPhone && requestedChannels.has("sms")) {
    rows.push({
      report_id: input.reportId,
      kind: input.kind ?? "submission_confirmation",
      channel: "sms",
      title: input.title,
      body: input.body,
      recipient_phone: input.contactPhone,
      metadata: input.metadata ?? {},
    })
  }

  if (rows.length === 0) {
    return []
  }

  const { data, error } = await client
    .from("notifications")
    .insert(mutationPayload(rows))
    .select("*")

  if (error || !data) {
    throw new EkiSignalBackendError("Unable to queue citizen notification.", {
      cause: error,
    })
  }

  return (data ?? []) as Tables["notifications"]["Row"][]
}

export async function notifyOffice(
  input: NotifyOfficeInput,
  clientArg?: TypedSupabaseClient | null
) {
  const client = getClient(clientArg)
  const office = await fetchOfficeById(client, input.officeId)
  const { data: handlers, error: handlerError } = await client
    .from("handlers")
    .select("*")
    .eq("office_id", input.officeId)
    .eq("is_active", true)

  if (handlerError) {
    throw new EkiSignalBackendError("Unable to load office handlers.", {
      cause: handlerError,
    })
  }

  const handlerRows = (handlers ?? []) as HandlerRow[]
  const requestedChannels = new Set(input.channels ?? ["email", "in_app"])
  const rows: Tables["notifications"]["Insert"][] = []

  if (office.email && requestedChannels.has("email")) {
    rows.push({
      report_id: input.reportId,
      recipient_office_id: office.id,
      kind: input.kind ?? "assignment",
      channel: "email",
      title: input.title,
      body: input.body,
      recipient_email: office.email,
      metadata: input.metadata ?? {},
    })
  }

  for (const handler of handlerRows) {
    if (handler.user_id && requestedChannels.has("in_app")) {
      rows.push({
        report_id: input.reportId,
        recipient_user_id: handler.user_id,
        recipient_handler_id: handler.id,
        recipient_office_id: office.id,
        kind: input.kind ?? "assignment",
        channel: "in_app",
        title: input.title,
        body: input.body,
        metadata: input.metadata ?? {},
      })
    }

    if (handler.email && requestedChannels.has("email")) {
      rows.push({
        report_id: input.reportId,
        recipient_handler_id: handler.id,
        recipient_office_id: office.id,
        kind: input.kind ?? "assignment",
        channel: "email",
        title: input.title,
        body: input.body,
        recipient_email: handler.email,
        metadata: input.metadata ?? {},
      })
    }
  }

  if (rows.length === 0) {
    return []
  }

  const { data, error } = await client
    .from("notifications")
    .insert(mutationPayload(rows))
    .select("*")

  if (error || !data) {
    throw new EkiSignalBackendError("Unable to queue office notification.", {
      cause: error,
    })
  }

  return (data ?? []) as Tables["notifications"]["Row"][]
}

export async function assignReport(
  input: AssignReportInput,
  clientArg?: TypedSupabaseClient | null
) {
  const client = getClient(clientArg)
  const report = await fetchReportById(client, input.reportId)
  const office = await fetchOfficeById(client, input.officeId)
  const nextStatus =
    input.status ??
    (report.current_status === "Received" || report.current_status === "Under Review"
      ? "Assigned"
      : report.current_status)

  const now = new Date().toISOString()

  const { error: closeError } = await client
    .from("assignments")
    .update(mutationPayload({
      is_current: false,
      closed_at: now,
    }))
    .eq("report_id", input.reportId)
    .eq("is_current", true)

  if (closeError) {
    throw new EkiSignalBackendError("Unable to close current assignment before reassignment.", {
      cause: closeError,
    })
  }

  const assignment = await requireSingle<AssignmentRow>(
    client
      .from("assignments")
      .insert(mutationPayload({
        report_id: input.reportId,
        office_id: input.officeId,
        handler_id: input.handlerId ?? null,
        routing_rule_id: input.routingRuleId ?? null,
        assigned_by_user_id: input.actorUserId ?? null,
        assignment_mode: input.assignmentMode ?? "manual",
        escalated: input.escalated ?? false,
        note: input.note ?? null,
      }))
      .select("*")
      .single() as PromiseLike<{ data: AssignmentRow | null; error: unknown }>,
    "Unable to create assignment."
  )

  const updatedReport = await requireSingle<ReportRow>(
    client
      .from("reports")
      .update(mutationPayload({
        assigned_office_id: input.officeId,
        current_assignment_id: assignment.id,
        current_status: nextStatus,
      }))
      .eq("id", input.reportId)
      .select("*")
      .single() as PromiseLike<{ data: ReportRow | null; error: unknown }>,
    "Unable to update the report assignment state."
  )

  const updateRow = await requireSingle<Tables["report_updates"]["Row"]>(
    client
      .from("report_updates")
      .insert(mutationPayload({
        report_id: input.reportId,
        assignment_id: assignment.id,
        status: nextStatus,
        title:
          nextStatus === "Assigned" ? "Assigned to office" : `Reassigned while status stayed ${nextStatus}`,
        note:
          input.note ??
          `${updatedReport.tracking_number} is now assigned to ${office.name}.`,
        visibility: input.visibility ?? "public",
        actor_user_id: input.actorUserId ?? null,
        actor_name_snapshot: input.actorName ?? "Routing Engine",
        actor_role_snapshot: input.actorRole ?? "Automation",
        metadata: {
          routingRuleId: input.routingRuleId ?? null,
          assignmentMode: input.assignmentMode ?? "manual",
          escalated: input.escalated ?? false,
        },
      }))
      .select("*")
      .single() as PromiseLike<{ data: Tables["report_updates"]["Row"] | null; error: unknown }>,
    "Unable to create the assignment timeline item."
  )

  await logAuditEvent(
    {
      reportId: input.reportId,
      actorUserId: input.actorUserId ?? null,
      entityType: "assignment",
      entityId: assignment.id,
      action: input.assignmentMode === "routing" ? "report_routed" : "report_assigned",
      actorRoleSnapshot: input.actorRole ?? "Automation",
      payload: {
        officeId: office.id,
        officeName: office.name,
        reportStatus: nextStatus,
        note: input.note ?? null,
      },
    },
    client
  )

  await notifyOffice(
    {
      reportId: input.reportId,
      officeId: input.officeId,
      kind: "assignment",
      title: `New assigned report ${updatedReport.tracking_number}`,
      body: `${updatedReport.title} is now assigned to ${office.name}.`,
      metadata: {
        trackingNumber: updatedReport.tracking_number,
        status: nextStatus,
      },
    },
    client
  )

  return {
    assignment,
    report: updatedReport,
    timelineItem: updateRow,
  }
}

export async function updateReportStatus(
  input: UpdateReportStatusInput,
  clientArg?: TypedSupabaseClient | null
) {
  const client = getClient(clientArg)
  const report = await fetchReportById(client, input.reportId)

  if (
    !input.force &&
    input.status !== report.current_status &&
    !allowedTransitions[report.current_status].includes(input.status)
  ) {
    throw new EkiSignalBackendError(
      `Invalid status transition from ${report.current_status} to ${input.status}.`
    )
  }

  const updatedReport = await requireSingle<ReportRow>(
    client
      .from("reports")
      .update(mutationPayload({
        current_status: input.status,
      }))
      .eq("id", input.reportId)
      .select("*")
      .single() as PromiseLike<{ data: ReportRow | null; error: unknown }>,
    "Unable to update report status."
  )

  if (input.status === "Closed" || input.status === "Rejected") {
    const { error: closeError } = await client
      .from("assignments")
      .update(mutationPayload({
        is_current: false,
        closed_at: new Date().toISOString(),
      }))
      .eq("report_id", input.reportId)
      .eq("is_current", true)

    if (closeError) {
      throw new EkiSignalBackendError("Unable to close active assignment for terminal status.", {
        cause: closeError,
      })
    }
  }

  const timelineItem = await requireSingle<Tables["report_updates"]["Row"]>(
    client
      .from("report_updates")
      .insert(mutationPayload({
        report_id: input.reportId,
        assignment_id: updatedReport.current_assignment_id,
        status: input.status,
        title: input.title ?? `Status changed to ${input.status}`,
        note: input.note,
        visibility: input.visibility ?? "public",
        actor_user_id: input.actorUserId ?? null,
        actor_name_snapshot: input.actorName ?? "Operations Desk",
        actor_role_snapshot: input.actorRole ?? "Moderator",
        metadata: input.metadata ?? {},
      }))
      .select("*")
      .single() as PromiseLike<{ data: Tables["report_updates"]["Row"] | null; error: unknown }>,
    "Unable to write report timeline update."
  )

  await logAuditEvent(
    {
      reportId: input.reportId,
      actorUserId: input.actorUserId ?? null,
      entityType: "report",
      entityId: input.reportId,
      action: "report_status_updated",
      actorRoleSnapshot: input.actorRole ?? "Moderator",
      payload: {
        fromStatus: report.current_status,
        toStatus: input.status,
        note: input.note,
      },
    },
    client
  )

  await notifyCitizen(
    {
      reportId: input.reportId,
      submittedByUserId: updatedReport.submitted_by,
      contactEmail: updatedReport.contact_email,
      contactPhone: updatedReport.contact_phone,
      kind: "status",
      title: `Status update for ${updatedReport.tracking_number}`,
      body: `${updatedReport.title} is now marked as ${input.status}.`,
      metadata: {
        trackingNumber: updatedReport.tracking_number,
        status: input.status,
      },
    },
    client
  )

  return {
    report: updatedReport,
    timelineItem,
  }
}

export async function submitCitizenReport(
  input: SubmitCitizenReportInput,
  clientArg?: TypedSupabaseClient | null
): Promise<SubmitCitizenReportResult> {
  const client = getClient(clientArg)
  const parsed = submissionInputSchema.parse(input)
  const [reportType, category, locationLookup] = await Promise.all([
    fetchReportType(client, parsed.reportTypeCode),
    fetchCategory(client, parsed.category),
    resolveLocationLookup(client, parsed.location),
  ])

  const location = await requireSingle<LocationRow>(
    client
      .from("locations")
      .insert(mutationPayload({
        state_name: parsed.location.stateName || ekitiState,
        lga_id: locationLookup.lga.id,
        ward_id: locationLookup.ward?.id ?? null,
        community: parsed.location.community?.trim() || null,
        area: parsed.location.area?.trim() || null,
        street_address: parsed.location.streetAddress?.trim() || null,
        landmark: parsed.location.landmark?.trim() || null,
        latitude: parsed.location.latitude ?? null,
        longitude: parsed.location.longitude ?? null,
        metadata: parsed.location.metadata ?? {},
      }))
      .select("*")
      .single() as PromiseLike<{ data: LocationRow | null; error: unknown }>,
    "Unable to save report location."
  )

  let report: ReportRow | null = null
  let lastInsertError: unknown = null

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const trackingNumber = await generateTrackingNumber(client)
    const { data, error } = await client
      .from("reports")
      .insert(mutationPayload({
        tracking_number: trackingNumber,
        submitted_by: parsed.submittedByUserId ?? null,
        report_type_id: reportType.id,
        category_id: category.id,
        location_id: location.id,
        current_status: "Received",
        severity: parsed.severity,
        title: parsed.title,
        description: parsed.description,
        landmark_note: parsed.landmarkNote?.trim() || null,
        is_anonymous: parsed.isAnonymous,
        contact_name: parsed.contactName?.trim() || null,
        contact_phone: parsed.contactPhone?.trim() || null,
        contact_email: parsed.contactEmail?.trim() || null,
        estimated_response_text: getEstimatedResponse(parsed.severity),
        source_channel: parsed.sourceChannel,
        metadata: parsed.metadata ?? {},
      }))
      .select("*")
      .single()

    if (!error && data) {
      report = data
      break
    }

    lastInsertError = error

    if ((error as { code?: string } | null)?.code !== "23505") {
      break
    }
  }

  if (!report) {
    throw new EkiSignalBackendError("Unable to create report record.", {
      cause: lastInsertError,
    })
  }

  const createdReport = report as ReportRow

  await requireSingle<Tables["report_updates"]["Row"]>(
    client
      .from("report_updates")
      .insert(mutationPayload({
        report_id: createdReport.id,
        status: "Received",
        title: parsed.reportTypeCode === "suggestion" ? "Suggestion received" : "Report received",
        note: "Your submission has been logged and is awaiting automated routing.",
        visibility: "public",
        actor_name_snapshot: "EkiSignal Intake",
        actor_role_snapshot: "Citizen platform",
      }))
      .select("*")
      .single() as PromiseLike<{ data: Tables["report_updates"]["Row"] | null; error: unknown }>,
    "Unable to create the initial report timeline item."
  )

  await persistReportMedia(client, createdReport.id, input.media ?? [])

  await logAuditEvent(
    {
      reportId: createdReport.id,
      actorUserId: parsed.submittedByUserId ?? null,
      entityType: "report",
      entityId: createdReport.id,
      action: "report_submitted",
      actorRoleSnapshot: parsed.isAnonymous ? "Anonymous citizen" : "Citizen",
      payload: {
        trackingNumber: createdReport.tracking_number,
        reportType: reportType.code,
        category: category.slug,
        lga: locationLookup.lga.name,
        ward: locationLookup.ward?.name ?? null,
        sourceChannel: parsed.sourceChannel,
      },
    },
    client
  )

  const routing = await routeReport(
    {
      categoryId: category.id,
      lgaId: locationLookup.lga.id,
      wardId: locationLookup.ward?.id ?? null,
    },
    client
  )

  const assignmentResult = await assignReport(
    {
      reportId: createdReport.id,
      officeId: routing.office.id,
      actorUserId: null,
      actorName: "Routing Engine",
      actorRole: routing.isFallback ? "Fallback routing" : "Automation",
      assignmentMode: routing.isFallback ? "moderation" : "routing",
      routingRuleId: routing.rule?.id ?? null,
      note: routing.reason,
      status: "Assigned",
      visibility: "public",
    },
    client
  )

  await notifyCitizen(
    {
      reportId: createdReport.id,
      submittedByUserId: createdReport.submitted_by,
      contactEmail: createdReport.contact_email,
      contactPhone: createdReport.contact_phone,
      kind: "submission_confirmation",
      title: `Tracking number ${createdReport.tracking_number} created`,
      body: `Your ${reportType.label.toLowerCase()} has been received and routed to ${routing.office.name}.`,
      metadata: {
        trackingNumber: createdReport.tracking_number,
        assignedOffice: routing.office.name,
        isFallback: routing.isFallback,
      },
    },
    client
  )

  return {
    report: assignmentResult.report,
    assignment: assignmentResult.assignment,
    routing,
    trackingNumber: createdReport.tracking_number,
  }
}

export async function getPublicReportTracking(
  trackingNumber: string,
  clientArg?: TypedSupabaseClient | null
) {
  const client = getClient(clientArg)
  const normalizedTrackingNumber = trackingNumber.trim().toUpperCase()
  const { data, error } = await client.rpc(
    "get_public_report_tracking",
    mutationPayload({
      tracking_number_input: normalizedTrackingNumber,
    })
  )

  if (error) {
    throw new EkiSignalBackendError("Unable to load the public report timeline.", {
      cause: error,
    })
  }

  return data
}

export async function createReportServiceClient() {
  return getClient()
}

export type {
  ServiceSupabaseClient,
  TypedSupabaseClient,
  AssignmentRow,
  ReportRow,
  OfficeRow,
  RoutingRuleRow,
  LocationRow,
  CategoryRow,
  ReportTypeRow,
  HandlerRow,
  LgaRow,
  WardRow,
}
