"use client"

import { useMemo, useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCheck,
  Clock3,
  CopyCheck,
  Flag,
  Globe2,
  Image as ImageIcon,
  Mail,
  MapPinned,
  MessageSquareLock,
  MessageSquareText,
  Phone,
  UserRound,
  Workflow,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { ReportMedia, ReportStatus, ReportUpdate } from "@/lib/types"
import { reportStatuses } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AdminReportDetailSheetProps {
  report: AdminReport | null
  open: boolean
  session: AdminSession
  permissions: RolePermissions
  onOpenChange: (open: boolean) => void
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

export function AdminReportDetailSheet({
  report,
  open,
  session,
  permissions,
  onOpenChange,
  onOpenAssignment,
  onChangeStatus,
  onEscalate,
  onReject,
  onMarkDuplicate,
  onResolve,
  onAddNote,
  onSetModerationFlag,
  onOpenMedia,
}: AdminReportDetailSheetProps) {
  if (!report) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <DetailSheetPanel
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
    </Sheet>
  )
}

function DetailSheetPanel({
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
}: Omit<AdminReportDetailSheetProps, "open" | "onOpenChange" | "report"> & {
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
    () => report.updates.filter((update) => update.visibility === "public").toSorted(sortAsc),
    [report]
  )
  const internalUpdates = useMemo(
    () => report.updates.filter((update) => update.visibility === "internal").toSorted(sortAsc),
    [report]
  )
  const statusHistory = useMemo(
    () =>
      reportStatuses
        .map((status) => ({
          status,
          update: report.updates
            .filter((entry) => entry.status === status)
            .toSorted(sortAsc)
            .at(-1),
        }))
        .filter((entry) => Boolean(entry.update)),
    [report]
  )

  const citizenName = permissions.viewCitizen
    ? report.contact.name
    : report.isAnonymous
      ? "Anonymous reporter"
      : "Masked for viewer role"

  return (
    <SheetContent
      side="right"
      className="w-full max-w-4xl overflow-y-auto border-l-white/60 bg-[#f6faf7]/96 p-0 backdrop-blur-xl sm:max-w-4xl"
    >
      <SheetHeader className="border-b border-white/60 bg-white/86 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SheetTitle className="text-xl sm:text-2xl">{report.title}</SheetTitle>
            <SheetDescription className="mt-2">
              {report.trackingNumber} • {report.assignedOfficeName}
            </SheetDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <SeverityBadge severity={report.severity} />
            <SlaBadge state={report.slaState} />
            <ModerationFlagBadge flag={report.moderationFlag} />
          </div>
        </div>
      </SheetHeader>

      <div className="px-5 pb-6 pt-5 sm:px-6">
        <Tabs defaultValue="overview" className="gap-5">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto rounded-none p-0">
            <TabsTrigger value="overview" className="rounded-full px-4 py-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="actions" className="rounded-full px-4 py-2">
              Notes & Actions
            </TabsTrigger>
            <TabsTrigger value="audit" className="rounded-full px-4 py-2">
              Audit Trail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-4">
              <InfoCard
                icon={Workflow}
                label="Assigned office"
                value={report.assignedOfficeName}
                helper={
                  report.escalationCount > 0
                    ? `${report.escalationCount} escalation note(s)`
                    : "Queue ownership visible"
                }
              />
              <InfoCard
                icon={Clock3}
                label="Last updated"
                value={format(new Date(report.latestAuditAt), "dd MMM yyyy, h:mm a")}
                helper={formatDistanceToNow(new Date(report.latestAuditAt), { addSuffix: true })}
              />
              <InfoCard
                icon={Flag}
                label="Category"
                value={report.category}
                helper={`Severity: ${report.severity}`}
              />
              <InfoCard
                icon={Globe2}
                label="Public visibility"
                value={report.isAnonymous ? "Anonymous in citizen view" : "Named citizen view"}
                helper={`Current role: ${roleLabel(session.role)}`}
              />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <Card className="rounded-[1.6rem] border-white/60 bg-white/86">
                <CardHeader>
                  <CardTitle>Citizen and location</CardTitle>
                  <CardDescription>
                    The exact originating details operators need before making a routing or moderation decision.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    icon={UserRound}
                    label="Citizen"
                    value={citizenName}
                    helper={report.isAnonymous ? "Anonymous in public reporting view" : "Named submission"}
                  />
                  <InfoCard
                    icon={Phone}
                    label="Phone"
                    value={permissions.viewCitizen ? report.contact.phone : maskPhone(report.contact.phone)}
                    helper={report.contact.email ? "Email available" : "Email not added"}
                  />
                  <InfoCard
                    icon={Mail}
                    label="Email"
                    value={
                      permissions.viewCitizen
                        ? report.contact.email || "Not provided"
                        : maskEmail(report.contact.email)
                    }
                    helper="Visible according to role permissions"
                  />
                  <InfoCard
                    icon={MapPinned}
                    label="Location"
                    value={[report.location.area, report.location.community, report.location.lga].filter(Boolean).join(", ")}
                    helper={[report.location.ward, report.location.landmark].filter(Boolean).join(" • ")}
                  />
                </CardContent>
              </Card>

              <Card className="rounded-[1.6rem] border-white/60 bg-white/86">
                <CardHeader>
                  <CardTitle>Status history</CardTitle>
                  <CardDescription>
                    Latest checkpoint reached at each public or internal status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {statusHistory.map((entry) => (
                    <div
                      key={entry.status}
                      className="flex items-center justify-between gap-3 rounded-[1.3rem] bg-foreground/[0.04] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{entry.status}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{entry.update?.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.update
                          ? format(new Date(entry.update.createdAt), "dd MMM, h:mm a")
                          : "Not reached"}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[1.6rem] border-white/60 bg-white/86">
              <CardHeader>
                <CardTitle>Issue description</CardTitle>
                <CardDescription>
                  Full citizen narrative for moderation, assignment, and response quality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-[1.4rem] bg-foreground/[0.04] px-4 py-4 text-sm leading-7 text-muted-foreground">
                  {report.description}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.6rem] border-white/60 bg-white/86">
              <CardHeader>
                <CardTitle>Media evidence</CardTitle>
                <CardDescription>
                  Click any thumbnail to review the original evidence in a focused viewer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.media.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {report.media.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onOpenMedia(item)}
                        className="rounded-[1.4rem] border border-white/60 bg-white/90 px-4 py-4 text-left shadow-[0_18px_42px_-32px_rgba(9,31,22,0.24)]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary/[0.08] text-primary">
                            <ImageIcon className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.kind.toUpperCase()} • {item.sizeLabel}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-primary/16 bg-primary/[0.04] px-4 py-4 text-sm leading-6 text-muted-foreground">
                    No media was attached to this report.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-5">
            {!permissions.changeStatus && !permissions.moderate ? (
              <Card className="rounded-[1.6rem] border-white/60 bg-white/86">
                <CardContent className="pt-4 text-sm leading-6 text-muted-foreground">
                  This role has read-only access to the report. Action controls remain visible for
                  transparency but are disabled.
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <ActionButton
                icon={ArrowRightLeft}
                label={["Received", "Under Review"].includes(report.status) ? "Assign" : "Reassign"}
                helper="Choose responsible office"
                onClick={() =>
                  onOpenAssignment(
                    ["Received", "Under Review"].includes(report.status) ? "assign" : "reassign",
                    report
                  )
                }
                disabled={!permissions.assign}
              />
              <ActionButton
                icon={AlertTriangle}
                label="Escalate"
                helper="Raise priority or senior visibility"
                onClick={() =>
                  onEscalate(
                    report.id,
                    actionNote || "Ticket escalated due to response delay or added urgency."
                  )
                }
                disabled={!permissions.changeStatus}
              />
              <ActionButton
                icon={CheckCheck}
                label="Resolve"
                helper="Mark active response complete"
                onClick={() =>
                  onResolve(
                    report.id,
                    actionNote || "Issue resolved and returned for citizen-facing verification."
                  )
                }
                disabled={!permissions.resolve}
              />
              <ActionButton
                icon={XCircle}
                label="Reject"
                helper="Reject invalid or abusive submissions"
                onClick={() =>
                  onReject(
                    report.id,
                    actionNote || "Submission rejected after moderation review."
                  )
                }
                disabled={!permissions.moderate}
                destructive
              />
              <ActionButton
                icon={CopyCheck}
                label="Mark duplicate"
                helper="Merge repeated submissions"
                onClick={() =>
                  onMarkDuplicate(
                    report.id,
                    duplicateOf,
                    actionNote || `Marked as a duplicate of ${duplicateOf || "another active ticket"}.`
                  )
                }
                disabled={!permissions.moderate || !duplicateOf.trim()}
              />
            </div>

            <Card className="rounded-[1.6rem] border-white/60 bg-white/86">
              <CardHeader>
                <CardTitle>Action context</CardTitle>
                <CardDescription>
                  Use one clear note to explain the next operational action. This can stay internal or be shared publicly when safe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={actionNote}
                  onChange={(event) => setActionNote(event.target.value)}
                  placeholder="Explain what is changing, why it matters, and what should happen next."
                  className="min-h-28 rounded-[1.2rem] bg-white"
                />
                <label className="flex items-start gap-3 rounded-[1.35rem] border border-white/60 bg-foreground/[0.03] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={sharePublicUpdate}
                    onChange={(event) => setSharePublicUpdate(event.target.checked)}
                    className="mt-1 size-4 rounded border-border accent-[var(--primary)]"
                  />
                  <span className="text-sm leading-6 text-muted-foreground">
                    When changing status below, publish the note to the citizen timeline if it is safe to share.
                  </span>
                </label>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
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
                    Change status
                  </button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 xl:grid-cols-2">
              <Card className="rounded-[1.6rem] border-white/60 bg-white/86">
                <CardHeader>
                  <CardTitle>Moderation controls</CardTitle>
                  <CardDescription>
                    Flag risky or duplicate submissions while keeping the reason auditable.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <Textarea
                      value={duplicateOf}
                      onChange={(event) => setDuplicateOf(event.target.value)}
                      placeholder="Optional duplicate tracking number or reference"
                      className="min-h-20 rounded-[1.2rem] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => onSetModerationFlag(report.id, moderationFlag)}
                      disabled={!permissions.moderate}
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-[1.2rem]")}
                    >
                      Update flag
                    </button>
                  </div>
                  {report.duplicateOf ? (
                    <p className="text-xs text-muted-foreground">
                      Duplicate reference currently set to {report.duplicateOf}.
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="rounded-[1.6rem] border-white/60 bg-white/86">
                <CardHeader>
                  <CardTitle>Internal notes</CardTitle>
                  <CardDescription>
                    Private guidance for moderators and handlers only.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <NoteList
                    updates={internalUpdates}
                    emptyMessage="No internal notes yet."
                    icon={MessageSquareLock}
                  />
                  <Textarea
                    value={internalNote}
                    onChange={(event) => setInternalNote(event.target.value)}
                    placeholder="Add internal operational context, moderation reasoning, or follow-up instructions."
                    className="min-h-24 rounded-[1.2rem] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onAddNote(report.id, "internal", internalNote)
                      setInternalNote("")
                    }}
                    disabled={!permissions.addInternalNotes || !internalNote.trim()}
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-[1.2rem]")}
                  >
                    Add internal note
                  </button>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[1.6rem] border-white/60 bg-white/86">
              <CardHeader>
                <CardTitle>Public notes</CardTitle>
                <CardDescription>
                  Citizen-facing notes should be clear, calm, and safe for public tracking.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NoteList
                  updates={publicUpdates}
                  emptyMessage="No public notes yet."
                  icon={MessageSquareText}
                />
                <Textarea
                  value={publicNote}
                  onChange={(event) => setPublicNote(event.target.value)}
                  placeholder="Share a citizen-safe update about screening, assignment, progress, or resolution."
                  className="min-h-24 rounded-[1.2rem] bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    onAddNote(report.id, "public", publicNote)
                    setPublicNote("")
                  }}
                  disabled={!permissions.addPublicNotes || !publicNote.trim()}
                  className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
                >
                  Add public note
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-5">
            <Card className="rounded-[1.6rem] border-white/60 bg-white/86">
              <CardHeader>
                <CardTitle>Audit trail and activity history</CardTitle>
                <CardDescription>
                  Every routing decision, note, escalation, and status change is visible here in chronological order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminActivityTimeline updates={report.updates} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SheetContent>
  )
}

function sortAsc(left: ReportUpdate, right: ReportUpdate) {
  return Date.parse(left.createdAt) - Date.parse(right.createdAt)
}

function InfoCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Workflow
  label: string
  value: string
  helper?: string
}) {
  return (
    <div className="rounded-[1.35rem] bg-foreground/[0.04] px-4 py-4">
      <p className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="size-3.5 text-primary" />
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  helper,
  onClick,
  disabled,
  destructive = false,
}: {
  icon: typeof Workflow
  label: string
  helper: string
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
        "rounded-[1.45rem] border px-4 py-4 text-left shadow-[0_18px_42px_-32px_rgba(9,31,22,0.22)] transition-colors",
        destructive
          ? "border-red-200 bg-red-50/70 text-red-800 enabled:hover:bg-red-50"
          : "border-white/60 bg-white/90 enabled:hover:bg-foreground/[0.02]",
        disabled && "cursor-not-allowed opacity-55"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-[1rem]",
            destructive ? "bg-red-100 text-red-700" : "bg-primary/[0.08] text-primary"
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{helper}</p>
        </div>
      </div>
    </button>
  )
}

function NoteList({
  updates,
  emptyMessage,
  icon: Icon,
}: {
  updates: ReportUpdate[]
  emptyMessage: string
  icon: typeof Workflow
}) {
  if (updates.length === 0) {
    return (
      <div className="rounded-[1.3rem] border border-dashed border-primary/16 bg-primary/[0.04] px-4 py-4 text-sm leading-6 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {updates.slice(-4).map((update) => (
        <div key={update.id} className="rounded-[1.3rem] bg-foreground/[0.04] px-4 py-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon className="size-4 text-primary" />
            {update.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{update.note}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {update.actorName} • {format(new Date(update.createdAt), "dd MMM, h:mm a")}
          </p>
        </div>
      ))}
    </div>
  )
}
