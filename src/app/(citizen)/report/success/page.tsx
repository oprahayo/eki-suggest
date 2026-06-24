"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  House,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from "lucide-react"

import { PageShell } from "@/components/citizen/page-shell"
import { buttonVariants } from "@/components/ui/button"
import { useReportCenter } from "@/hooks/use-report-center"
import { cn } from "@/lib/utils"

function SuccessOrb({
  mode,
}: {
  mode: "submitted" | "queued" | "draft"
}) {
  const icon =
    mode === "submitted" ? (
      <CheckCircle2 className="size-9" />
    ) : mode === "queued" ? (
      <Clock3 className="size-9" />
    ) : (
      <WifiOff className="size-9" />
    )

  return (
    <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-[1.8rem] bg-[radial-gradient(circle_at_center,rgba(15,92,67,0.12),transparent_60%),linear-gradient(180deg,rgba(15,92,67,0.08),rgba(255,255,255,0))]">
      <motion.span
        className="absolute size-28 rounded-full border border-primary/16"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.7, 1.14, 1.2], opacity: [0, 0.55, 0] }}
        transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        className="absolute size-20 rounded-full border border-primary/20"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: [0.7, 1.06, 1.14], opacity: [0, 0.45, 0] }}
        transition={{ duration: 1.7, repeat: Infinity, delay: 0.2, ease: "easeOut" }}
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex size-[4.5rem] items-center justify-center rounded-[1.6rem] bg-primary text-primary-foreground shadow-[0_24px_58px_-30px_rgba(15,92,67,0.8)]"
      >
        {icon}
      </motion.div>
    </div>
  )
}

export default function ReportSuccessPage() {
  const searchParams = useSearchParams()
  const trackingNumber = searchParams.get("tracking") ?? ""
  const queuedId = searchParams.get("queued") ?? ""
  const isDraftSaved = searchParams.get("draft") === "1"
  const { findPendingSubmissionById, findReportByTrackingNumber } = useReportCenter()
  const report = trackingNumber ? findReportByTrackingNumber(trackingNumber) : undefined
  const pendingSubmission = queuedId ? findPendingSubmissionById(queuedId) : undefined

  if (isDraftSaved) {
    return (
      <div className="px-4 pb-8 pt-3 sm:px-6">
        <PageShell
          eyebrow="Draft saved"
          title="Your draft is protected on this device"
          description="Because you were offline with media attached, EkiSignal kept the report locally and left it ready for a safer resubmit."
          compact
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="overflow-hidden rounded-[2.1rem] border border-white/60 bg-white/88 p-6 shadow-[0_36px_100px_-52px_rgba(8,28,20,0.46)] backdrop-blur">
              <SuccessOrb mode="draft" />

              <div className="mt-6">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
                  Saved state
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                  Offline draft ready
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Reconnect, reopen the reporting flow, and re-add photos or video before final submission. Your typed details are already saved.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Link
                  href="/report/new"
                  className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
                >
                  <NotebookPen data-icon="inline-start" />
                  Resume draft
                </Link>
                <Link
                  href="/my-reports"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-[1.2rem]"
                  )}
                >
                  <Sparkles data-icon="inline-start" />
                  My reports
                </Link>
                <Link
                  href="/"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-[1.2rem]"
                  )}
                >
                  <House data-icon="inline-start" />
                  Go home
                </Link>
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-[1.95rem] border border-white/60 bg-white/82 p-5 backdrop-blur">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
                  Next steps
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-[1.35rem] bg-foreground/[0.04] px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">1. Reconnect</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Wait until signal is back so the upload step can work properly.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] bg-foreground/[0.04] px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">2. Re-add media</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      For privacy and reliability, photos and video are not persisted between offline sessions.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] bg-foreground/[0.04] px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">3. Submit to get a ticket</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Once sent, EkiSignal will generate the tracking number immediately.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </PageShell>
      </div>
    )
  }

  if (queuedId) {
    return (
      <div className="px-4 pb-8 pt-3 sm:px-6">
        <PageShell
          eyebrow="Queued offline"
          title="Your report is safely queued"
          description="EkiSignal saved the report locally and will turn it into a live ticket as soon as connectivity returns."
          compact
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="overflow-hidden rounded-[2.1rem] border border-white/60 bg-white/88 p-6 shadow-[0_36px_100px_-52px_rgba(8,28,20,0.46)] backdrop-blur">
              <SuccessOrb mode="queued" />

              <div className="mt-6">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
                  Queue reference
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                  {queuedId}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {pendingSubmission
                    ? `Your ${pendingSubmission.payload.category.toLowerCase()} ${pendingSubmission.payload.kind} will be submitted automatically when signal comes back.`
                    : "Your saved report will be restored into the citizen timeline automatically when connectivity returns."}
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Link
                  href="/my-reports"
                  className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
                >
                  <Sparkles data-icon="inline-start" />
                  My reports
                </Link>
                <Link
                  href="/report/new"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-[1.2rem]"
                  )}
                >
                  <NotebookPen data-icon="inline-start" />
                  Submit another
                </Link>
                <Link
                  href="/"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-[1.2rem]"
                  )}
                >
                  <House data-icon="inline-start" />
                  Go home
                </Link>
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-[1.95rem] border border-white/60 bg-white/82 p-5 backdrop-blur">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
                  What happens next
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-[1.35rem] bg-foreground/[0.04] px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">1. Connection returns</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      The offline outbox checks again automatically when the browser is back online.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] bg-foreground/[0.04] px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">2. Ticket is created</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      The queued report becomes a normal tracked case and appears in your reports list.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] bg-foreground/[0.04] px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">3. Updates stay visible</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Once the ticket exists, its timeline and office routing become visible from the tracking page.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </PageShell>
      </div>
    )
  }

  return (
    <div className="px-4 pb-8 pt-3 sm:px-6">
      <PageShell
        eyebrow="Submitted"
        title="Your ticket is now live"
        description="EkiSignal created a tracking number immediately and pushed the report into the right queue preview for moderation and routing."
        compact
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="overflow-hidden rounded-[2.1rem] border border-white/60 bg-white/88 p-6 shadow-[0_36px_100px_-52px_rgba(8,28,20,0.46)] backdrop-blur">
            <SuccessOrb mode="submitted" />

            <div className="mt-6">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
                Tracking number
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                {trackingNumber || "Pending"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {report
                  ? `Your ${report.kind} has been routed first to ${report.assignedOfficeName}.`
                  : "Your report is now queued for moderation, routing, and public-safe status updates."}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-primary/[0.05] px-4 py-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary/70">
                  Next expected review
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {report?.estimatedResponse ?? "First review window will appear once routing completes."}
                </p>
              </div>
              <div className="rounded-[1.35rem] bg-primary/[0.05] px-4 py-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary/70">
                  Public identity
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {report?.isAnonymous ? "Anonymous in public timeline" : "Named submission"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link
                href={`/track?tracking=${encodeURIComponent(trackingNumber)}`}
                className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
              >
                <ShieldCheck data-icon="inline-start" />
                Track this report
              </Link>
              <Link
                href="/report/new"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-[1.2rem]"
                )}
              >
                <Sparkles data-icon="inline-start" />
                Submit another report
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-[1.2rem]"
                )}
              >
                <House data-icon="inline-start" />
                Go home
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[1.95rem] border border-white/60 bg-white/82 p-5 backdrop-blur">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
                What happens next
              </p>
              <div className="mt-4 space-y-4">
                <div className="rounded-[1.35rem] bg-foreground/[0.04] px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">1. Screening and moderation</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    The report is checked for safety, completeness, and duplicate issues.
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-foreground/[0.04] px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">2. Assignment into a live queue</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Routing rules or an admin send it to the correct office or handler desk.
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-foreground/[0.04] px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">3. Transparent progress updates</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Public-safe notes and status changes appear on the tracking page over time.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.95rem] border border-primary/16 bg-primary/[0.05] p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-[1.15rem] bg-primary/10 text-primary">
                  <ArrowRight className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Keep the tracking number safe
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    You can return later with {trackingNumber || "your ticket number"} to check status even without a full account system.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </PageShell>
    </div>
  )
}
