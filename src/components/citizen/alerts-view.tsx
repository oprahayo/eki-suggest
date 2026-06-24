"use client"

import { useMemo, useState } from "react"
import {
  Bell,
  BellDot,
  CircleAlert,
  Dot,
  Gift,
  RadioTower,
  Sparkles,
} from "lucide-react"

import { PageShell } from "@/components/citizen/page-shell"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useReportCenter } from "@/hooks/use-report-center"
import { transparencySnapshots } from "@/lib/demo-data"
import { formatLagosTimestamp } from "@/lib/dates"

type AlertFilter = "all" | "unread" | "status" | "notice" | "reward"

const filterOptions: { value: AlertFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "status", label: "Status" },
  { value: "notice", label: "Notices" },
  { value: "reward", label: "Recognition" },
]

const notificationKindMeta = {
  assignment: {
    icon: BellDot,
    label: "Assignment",
  },
  status: {
    icon: Bell,
    label: "Status",
  },
  notice: {
    icon: CircleAlert,
    label: "Notice",
  },
  system: {
    icon: Sparkles,
    label: "System",
  },
  reward: {
    icon: Gift,
    label: "Recognition",
  },
  impact: {
    icon: RadioTower,
    label: "Impact",
  },
} as const

export function AlertsView() {
  const { notifications, notices, markNotificationRead } = useReportCenter()
  const [activeFilter, setActiveFilter] = useState<AlertFilter>("all")
  const unreadCount = notifications.filter((notification) => !notification.read).length
  const latestImpact = transparencySnapshots[0]

  const visibleNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (activeFilter === "all") {
        return true
      }

      if (activeFilter === "unread") {
        return !notification.read
      }

      if (activeFilter === "reward") {
        return notification.kind === "reward" || notification.kind === "impact"
      }

      return notification.kind === activeFilter
    })
  }, [activeFilter, notifications])

  return (
    <PageShell
      eyebrow="Notification center"
      title="Alerts, public notices, and civic updates"
      description="Status movement, assignment updates, public notices, and badge decisions all stay visible here so the platform feels accountable instead of silent."
    >
      <div className="surface-panel rounded-[1.9rem] px-5 py-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="section-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.72rem] font-semibold text-primary">
            <Bell className="size-3.5" />
            {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
          </div>
          <div className="section-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.72rem] font-semibold text-foreground">
            <CircleAlert className="size-3.5 text-accent-foreground" />
            {notices.length} public notice{notices.length === 1 ? "" : "s"}
          </div>
          <div className="section-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.72rem] font-semibold text-foreground">
            <Gift className="size-3.5 text-primary" />
            {latestImpact.verifiedReportsSupported} verified reports supported this cycle
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-panel min-w-0 space-y-4 rounded-[1.9rem] p-5 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bell className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Citizen notifications</h2>
                <p className="text-sm text-muted-foreground">
                  Submission confirmations, status movement, badge review, and assignment updates.
                </p>
              </div>
            </div>
            <div className="-mx-1 w-[calc(100%+0.5rem)] overflow-x-auto pb-1 pr-1 sm:mx-0 sm:w-auto sm:overflow-visible sm:pb-0 sm:pr-0">
              <ToggleGroup
                value={[activeFilter]}
                onValueChange={(nextValue) => {
                  if (nextValue[0]) {
                    setActiveFilter(nextValue[0] as AlertFilter)
                  }
                }}
                variant="outline"
                spacing={2}
                className="min-w-max"
              >
                {filterOptions.map((item) => (
                  <ToggleGroupItem key={item.value} value={item.value}>
                    {item.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          <div className="space-y-3">
            {visibleNotifications.length > 0 ? visibleNotifications.map((notification) => {
              const kindMeta = notificationKindMeta[notification.kind]
              const KindIcon = kindMeta.icon

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markNotificationRead(notification.id)}
                  className="surface-muted interactive-press w-full rounded-[1.45rem] px-4 py-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <KindIcon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {!notification.read ? (
                              <Dot className="size-5 shrink-0 text-primary" />
                            ) : null}
                            <p className="text-sm font-semibold text-foreground">
                              {notification.title}
                            </p>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{kindMeta.label}</Badge>
                            {notification.read ? (
                              <Badge variant="outline">Read</Badge>
                            ) : (
                              <Badge>New</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {notification.body}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {formatLagosTimestamp(notification.createdAt)}
                    </p>
                  </div>
                </button>
              )
            }) : (
              <div className="rounded-[1.45rem] border border-dashed border-primary/16 bg-primary/[0.04] px-4 py-5 text-sm leading-6 text-muted-foreground">
                No notifications match this filter right now. New civic updates, badge decisions,
                or assignment movement will appear here as soon as they are published.
              </div>
            )}
          </div>
        </section>

        <section className="surface-panel min-w-0 space-y-4 rounded-[1.9rem] p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/15 text-foreground">
              <CircleAlert className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Area notices</h2>
              <p className="text-sm text-muted-foreground">
                Public service notices and verified updates from Ekiti field teams.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {notices.map((notice) => (
              <article key={notice.id} className="surface-muted rounded-[1.45rem] px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={notice.tone === "warning" ? "destructive" : "secondary"}>
                    {notice.area}
                  </Badge>
                  {notice.category ? <Badge variant="outline">{notice.category}</Badge> : null}
                  {notice.impactLabel ? <Badge variant="outline">{notice.impactLabel}</Badge> : null}
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{notice.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{notice.body}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{notice.office ?? "Public notice"}</span>
                  <span>{formatLagosTimestamp(notice.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  )
}
