"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock3, MapPin, ShieldCheck, Ticket } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  DrawerClose,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { formatLagosTimestamp } from "@/lib/dates"
import type { ReportRecord } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PublicSignalSheetProps {
  report: ReportRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function officeLabel(report: ReportRecord) {
  return report.category === "Corruption / Service Delay"
    ? "Protected moderation queue"
    : report.assignedOfficeName
}

export function PublicSignalSheet({
  report,
  open,
  onOpenChange,
}: PublicSignalSheetProps) {
  const { isAuthenticated, session, requestSignIn } = useAuth()

  if (!report) {
    return null
  }

  const publicUpdates = report.updates
    .filter((update) => update.visibility === "public")
    .toSorted((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 4)
  const coverMedia = report.media.find((media) => media.kind === "image" && media.previewUrl)
  const isOfficialUser =
    session?.role === "super_admin" ||
    session?.role === "moderator" ||
    session?.role === "government_handler"

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        overlayClassName="bg-black/6"
        overlayStyle={{ top: "calc(5.25rem + env(safe-area-inset-top))" }}
        className="rounded-t-[2rem] border-white/70 bg-[linear-gradient(180deg,rgba(248,249,244,0.98),rgba(240,246,240,0.96))] md:top-1/2 md:left-1/2 md:bottom-auto md:inset-x-auto md:mt-0 md:max-h-[min(46rem,86vh)] md:w-[min(46rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[2rem] md:border md:shadow-[0_38px_110px_-54px_rgba(8,28,20,0.5)]"
      >
        <DrawerHeader className="mx-auto w-full max-w-3xl px-5 pt-3 text-left md:px-6 md:pt-5">
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-foreground/12 md:hidden" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={report.status} />
                <SeverityBadge severity={report.severity} />
                <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                  {report.category}
                </span>
              </div>
              <DrawerTitle className="mt-3 text-left text-xl font-semibold tracking-tight md:text-[1.75rem]">
                {report.title}
              </DrawerTitle>
              {report.source === "demo" ? (
                <p className="mt-2 text-xs font-semibold text-amber-800">Fictional preview · No verified government activity</p>
              ) : null}
              <DrawerDescription className="mt-2 max-w-2xl text-left leading-6">
                {report.description}
              </DrawerDescription>
            </div>

            <DrawerClose
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "mt-0.5 size-10 rounded-full border-white/70 bg-white/82 text-foreground shadow-soft"
              )}
              aria-label="Back to map"
            >
              <ArrowLeft className="size-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="mx-auto max-h-[72vh] w-full max-w-3xl overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:px-6">
          {coverMedia?.previewUrl ? (
            <div className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/88 shadow-soft">
              <Image
                src={coverMedia.previewUrl}
                alt={report.title}
                width={960}
                height={360}
                className="h-44 w-full object-cover"
              />
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="surface-panel rounded-[1.4rem] px-4 py-3.5 shadow-soft sm:col-span-2">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Tracking number
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <Ticket className="size-4 text-primary" />
                {report.trackingNumber}
              </p>
            </div>
            <div className="surface-panel rounded-[1.4rem] px-4 py-3.5 shadow-soft">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Location
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="size-4 text-primary" />
                {[report.location.area || report.location.community, report.location.lga]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {report.mapPositionKind === "approximate"
                  ? "Approximate map position based on available area information—not an exact address."
                  : "Location provided for this fictional example."}
              </p>
            </div>
            <div className="surface-panel rounded-[1.4rem] px-4 py-3.5 shadow-soft">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Handling office
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                {officeLabel(report)}
              </p>
            </div>
            <div className="surface-panel rounded-[1.4rem] px-4 py-3.5 shadow-soft">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Submitted
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock3 className="size-4 text-primary" />
                {formatLagosTimestamp(report.createdAt)}
              </p>
            </div>
            <div className="surface-panel rounded-[1.4rem] px-4 py-3.5 shadow-soft">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Last updated
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {formatLagosTimestamp(report.updatedAt)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
              Public timeline summary
            </p>
            <div className="mt-3 space-y-3">
              {publicUpdates.map((update) => (
                <div key={update.id} className="surface-muted rounded-[1.4rem] px-4 py-3.5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{update.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {update.note}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatLagosTimestamp(update.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 pb-1">
            {isAuthenticated ? (
              <Link
                href={`/track?tracking=${encodeURIComponent(report.trackingNumber)}`}
                className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
              >
                Track full report
              </Link>
            ) : (
              <Link
                href={requestSignIn(`/track?tracking=${encodeURIComponent(report.trackingNumber)}`)}
                className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
              >
                Sign in to track
              </Link>
            )}
            {isOfficialUser ? (
              <Link
                href="/admin"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-[1.2rem] border-white/70 bg-white/80"
                )}
              >
                Open official workspace
              </Link>
            ) : (
              <Link
                href="/admin"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-[1.2rem] border-white/70 bg-white/80"
                )}
              >
                Official sign in
              </Link>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
