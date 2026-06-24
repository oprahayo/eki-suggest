"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCheck,
  CopyCheck,
  FileImage,
  Flag,
  Globe2,
  Mail,
  MapPinned,
  MessageSquareLock,
  MessageSquareText,
  Phone,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react"

import { AdminActivityTimeline } from "@/components/admin/admin-activity-timeline"
import { ModerationFlagBadge, SlaBadge } from "@/components/admin/admin-badges"
import type {
  AdminReport,
  AdminSession,
  ModerationFlag,
  RolePermissions,
} from "@/components/admin/admin-utils"
import { maskEmail, maskPhone, moderationFlags, roleLabel } from "@/components/admin/admin-utils"
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { reportStatuses } from "@/lib/types"
import type { ReportMedia, ReportStatus, ReportUpdate } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AdminReportWorkbenchPanelProps {
  report: AdminReport | null
  session: AdminSession
  permissions: RolePermissions
  onOpenAssignment: (mode: "assign" | "reassign", report: AdminReport) => void
  onChangeStatus: (
    reportId: string,
    status: ReportStatus,
    note: string,
    visibility: "public" | "internal"
  ) => void
  onEscalate: (reportId: string, note: string) => void
  onReject: (reportId: string, note: string) => void
  onMarkDuplicate: (reportId: string, duplicateOf: string, note: string) => void
  onResolve: (reportId: string, note: string) => void
  onAddNote: (reportId: string, kind: "internal" | "public", body: string) => void
  onSetModerationFlag: (reportId: string, flag: ModerationFlag) => void
  onOpenMedia: (media: ReportMedia) => void
}

export function AdminReportWorkbenchPanel({
  report,
  session,
  permissions,
  onOpenAssignment,
  onChangeStatus,
  onEscalate,
  onReject,
  onMarkDuplicate,
  onResolve,
  onAddNote,
  onSetModerationFlag,
  onOpenMedia,
}: AdminReportWorkbenchPanelProps) {
  if (!report) {
    return (
      <aside className="surface-panel sticky top-6 rounded-[1.8rem] px-5 py-5 shadow-soft xl:min-h-[calc(100vh-4rem)]">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
          Report workbench
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          Select a report row
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The detail workbench stays here while the list remains visible. Pick any row to inspect
          metadata, review the public timeline, and take the next action.
        </p>
        <div className="mt-5 rounded-[1.45rem] border border-dashed border-primary/16 bg-primary/[0.04] px-4 py-4 text-sm leading-6 text-muted-foreground">
          Use the filter bar and sortable table to narrow the queue, then open a row for routing,
          moderation, or progress updates.
        </div>
      </aside>
    )
  }

  return (
    <WorkbenchContent
      key={`${report.id}-${report.latestAuditAt}-${report.moderationFlag}-${report.duplicateOf ?? "none"}`}
      report={report}
      session={session}
      permissions={permissions}
      onOpenAssignment={onOpenAssignment}
      onChangeStatus={onChangeStatus}
      onEscalate={onEscalate}
      onReject={onReject}
      onMarkDuplicate={onMarkDuplicate}
      onResolve={onResolve}
      onAddNote={onAddNote}
      onSetModerationFlag={onSetModerationFlag}
      onOpenMedia={onOpenMedia}
    />
  )
}

function WorkbenchContent({
  report,
  session,
  permissions,
  onOpenAssignment,
  onChangeStatus,
  onEscalate,
  onReject,
  onMarkDuplicate,
  onResolve,
  onAddNote,
  onSetModerationFlag,
  onOpenMedia,
}: Omit<AdminReportWorkbenchPanelProps, "report"> & {
  report: AdminReport
}) {
  const [statusDraft, setStatusDraft] = useState<ReportStatus>(report.status)
  const [actionNote, setActionNote] = useState("")
  const [sharePublicUpdate, setSharePublicUpdate] = useState(true)
  const [internalNote, setInternalNote] = useState("")
  const [publicNote, setPublicNote] = useState("")
  const [duplicateOf, setDuplicateOf] = useState(report.duplicateOf ?? "")
  const [moderationFlag, setModerationFlag] = useState<ModerationFlag>(report.moderationFlag)

  const publicUpdates = useMemo(
    () => report.updates.filter((update) => update.visibility === "public").toSorted(sortDesc),
    [report]
  )
  const internalUpdates = useMemo(
    () => report.updates.filter((update) => update.visibility === "internal").toSorted(sortDesc),
    [report]
  )

  const citizenName = permissions.viewCitizen
    ? report.contact.name
    : report.isAnonymous
      ? "Anonymous reporter"
      : "Masked for viewer role"

  const actionDisabled = !permissions.changeStatus && !permissions.moderate

  return (
    <aside className="surface-panel sticky top-6 rounded-[1.8rem] shadow-soft xl:max-h-[calc(100vh-3rem)] xl:overflow-hidden">
      <div className="border-b border-white/60 px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary/72">
              Report workbench
            </p>
            <h3 className="mt-2 truncate text-lg font-semibold tracking-tight text-foreground">
              {report.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {report.trackingNumber} • {report.assignedOfficeName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <SeverityBadge severity={report.severity} />
            <SlaBadge state={report.slaState} />
            <ModerationFlagBadge flag={report.moderationFlag} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <ToolbarButton
            icon={ArrowRightLeft}
            label={["Received", "Under Review"].includes(report.status) ? "Assign" : "Reassign"}
            onClick={() =>
              onOpenAssignment(
                ["Received", "Under Review"].includes(report.status) ? "assign" : "reassign",
                report
              )
            }
            disabled={!permissions.assign}
          />
          <ToolbarButton
            icon={AlertTriangle}
            label="Escalate"
            onClick={() =>
              onEscalate(
                report.id,
                actionNote || "Ticket escalated due to delay, severity, or new public risk."
              )
            }
            disabled={!permissions.changeStatus}
          />
          <ToolbarButton
            icon={CheckCheck}
            label="Resolve"
            onClick={() =>
              onResolve(
                report.id,
                actionNote || "Issue resolved and returned for citizen-facing confirmation."
              )
            }
            disabled={!permissions.resolve}
          />
          <ToolbarButton
            icon={XCircle}
            label="Reject"
            onClick={() =>
              onReject(report.id, actionNote || "Submission rejected after moderation review.")
            }
            disabled={!permissions.moderate}
            destructive
          />
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 xl:max-h-[calc(100vh-13rem)] xl:overflow-y-auto">
        <section className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetaRow icon={UserRound} label="Citizen" value={citizenName} />
            <MetaRow
              icon={Phone}
              label="Phone"
              value={permissions.viewCitizen ? report.contact.phone : maskPhone(report.contact.phone)}
            />
            <MetaRow
              icon={Mail}
              label="Email"
              value={
                permissions.viewCitizen
                  ? report.contact.email || "Not provided"
                  : maskEmail(report.contact.email)
              }
            />
            <MetaRow
              icon={MapPinned}
              label="Location"
              value={[report.location.area || report.location.community, report.location.lga]
                .filter(Boolean)
                .join(", ")}
              helper={[report.location.ward, report.location.landmark].filter(Boolean).join(" • ")}
            />
            <MetaRow
              icon={Flag}
              label="Category"
              value={report.category}
              helper={`Submitted ${format(new Date(report.createdAt), "dd MMM yyyy, h:mm a")}`}
            />
            <MetaRow
              icon={Globe2}
              label="Public visibility"
              value={report.isAnonymous ? "Anonymous in public feed" : "Named in public feed"}
              helper={`Role: ${roleLabel(session.role)}`}
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-foreground">Status and action note</h4>
            {actionDisabled ? (
              <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Read only
              </span>
            ) : null}
          </div>
          <Textarea
            value={actionNote}
            onChange={(event) => setActionNote(event.target.value)}
            placeholder="Explain what is changing, why it matters, and what should happen next."
            className="min-h-28 rounded-[1.25rem] bg-white"
          />
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <Select
              value={statusDraft}
              onValueChange={(value) => setStatusDraft((value ?? report.status) as ReportStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose next status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {reportStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() =>
                onChangeStatus(
                  report.id,
                  statusDraft,
                  actionNote || `Status updated to ${statusDraft}.`,
                  sharePublicUpdate ? "public" : "internal"
                )
              }
              disabled={!permissions.changeStatus}
              className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
            >
              Apply status
            </button>
          </div>
          <label className="flex items-start gap-3 rounded-[1.25rem] border border-white/60 bg-white/72 px-4 py-3.5">
            <input
              type="checkbox"
              checked={sharePublicUpdate}
              onChange={(event) => setSharePublicUpdate(event.target.checked)}
              className="mt-1 size-4 rounded border-border accent-[var(--primary)]"
            />
            <span className="text-sm leading-6 text-muted-foreground">
              Publish the action note to the public timeline when it is safe for citizens to read.
            </span>
          </label>
        </section>

        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Moderation and duplicate handling</h4>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <Select
              value={moderationFlag}
              onValueChange={(value) => setModerationFlag((value ?? "none") as ModerationFlag)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose moderation flag" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {moderationFlags.map((flag) => (
                    <SelectItem key={flag} value={flag}>
                      {flag === "none" ? "No flag" : flag.charAt(0).toUpperCase() + flag.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => onSetModerationFlag(report.id, moderationFlag)}
              disabled={!permissions.moderate}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-[1.2rem]"
              )}
            >
              Update flag
            </button>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <Textarea
              value={duplicateOf}
              onChange={(event) => setDuplicateOf(event.target.value)}
              placeholder="Duplicate tracking number or reference, if this report repeats another active case."
              className="min-h-20 rounded-[1.25rem] bg-white"
            />
            <button
              type="button"
              onClick={() =>
                onMarkDuplicate(
                  report.id,
                  duplicateOf,
                  actionNote || `Marked as a duplicate of ${duplicateOf || "another active ticket"}.`
                )
              }
              disabled={!permissions.moderate || !duplicateOf.trim()}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-[1.2rem]"
              )}
            >
              <CopyCheck data-icon="inline-start" />
              Mark duplicate
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Evidence and notes</h4>
          {report.media.length > 0 ? (
            <div className="space-y-2">
              {report.media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenMedia(item)}
                  className="interactive-press flex w-full items-center justify-between gap-3 rounded-[1.2rem] border border-white/60 bg-white/84 px-4 py-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.kind.toUpperCase()} • {item.sizeLabel}
                    </p>
                  </div>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-[0.95rem] bg-primary/8 text-primary">
                    <FileImage className="size-4.5" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-primary/16 bg-primary/[0.04] px-4 py-3.5 text-sm leading-6 text-muted-foreground">
              No media was attached to this report.
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquareLock className="size-4 text-primary" />
                <h5 className="text-sm font-semibold text-foreground">Internal notes</h5>
              </div>
              <NoteRows updates={internalUpdates} emptyMessage="No internal notes yet." />
              <Textarea
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                placeholder="Private guidance for moderators and handlers."
                className="min-h-24 rounded-[1.2rem] bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  onAddNote(report.id, "internal", internalNote)
                  setInternalNote("")
                }}
                disabled={!permissions.addInternalNotes || !internalNote.trim()}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full rounded-[1.2rem]"
                )}
              >
                Save internal note
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquareText className="size-4 text-primary" />
                <h5 className="text-sm font-semibold text-foreground">Public notes</h5>
              </div>
              <NoteRows updates={publicUpdates} emptyMessage="No public notes yet." />
              <Textarea
                value={publicNote}
                onChange={(event) => setPublicNote(event.target.value)}
                placeholder="Citizen-safe update about screening, assignment, progress, or resolution."
                className="min-h-24 rounded-[1.2rem] bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  onAddNote(report.id, "public", publicNote)
                  setPublicNote("")
                }}
                disabled={!permissions.addPublicNotes || !publicNote.trim()}
                className={cn(buttonVariants({ size: "lg" }), "w-full rounded-[1.2rem]")}
              >
                Post public note
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Audit timeline</h4>
          </div>
          <AdminActivityTimeline updates={report.updates} />
        </section>
      </div>
    </aside>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  destructive = false,
}: {
  icon: typeof ShieldCheck
  label: string
  onClick: () => void
  disabled: boolean
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
        destructive
          ? "border-red-200 bg-red-50/80 text-red-700 enabled:hover:bg-red-100/80"
          : "border-white/70 bg-white/84 text-foreground enabled:hover:bg-primary/[0.05]",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  )
}

function MetaRow({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof UserRound
  label: string
  value: string
  helper?: string
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/60 bg-white/76 px-4 py-3.5">
      <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="size-3.5 text-primary" />
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
    </div>
  )
}

function NoteRows({
  updates,
  emptyMessage,
}: {
  updates: ReportUpdate[]
  emptyMessage: string
}) {
  if (updates.length === 0) {
    return (
      <div className="rounded-[1.2rem] border border-dashed border-primary/16 bg-primary/[0.04] px-4 py-3 text-sm leading-6 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-white/60 bg-white/72">
      {updates.slice(0, 4).map((update, index) => (
        <div
          key={update.id}
          className={cn("px-4 py-3", index !== 0 && "border-t border-white/60")}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{update.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{update.note}</p>
            </div>
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {format(new Date(update.createdAt), "dd MMM, h:mm a")}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function sortDesc(left: ReportUpdate, right: ReportUpdate) {
  return Date.parse(right.createdAt) - Date.parse(left.createdAt)
}
