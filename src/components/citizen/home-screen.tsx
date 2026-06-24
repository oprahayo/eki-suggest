"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
  ArrowRight,
  BellRing,
  FilePenLine,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react"

import { EkiSignalMark } from "@/components/shared/ekisignal-mark"
import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useReportCenter } from "@/hooks/use-report-center"
import { cn } from "@/lib/utils"

const activeStatuses = new Set(["Received", "Under Review", "Assigned", "In Progress"])

export function HomeScreen() {
  const { reports, notices, selectedArea } = useReportCenter()
  const { isAuthenticated, requestSignIn } = useAuth()

  const summary = useMemo(() => {
    const openSignals = reports.filter((report) => activeStatuses.has(report.status)).length
    const resolvedSignals = reports.filter(
      (report) => report.status === "Resolved" || report.status === "Closed"
    ).length

    return {
      openSignals,
      resolvedSignals,
      noticePreview: notices.slice(0, 2),
    }
  }, [notices, reports])

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ height: "100svh" }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,173,69,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(17,93,69,0.12),transparent_24%),linear-gradient(180deg,#f8f7f2_0%,#f4f7f1_48%,#eef3ee_100%)]" />
      <div className="absolute inset-x-0 top-[22%] h-[34svh] bg-[radial-gradient(circle,rgba(17,93,69,0.08),transparent_60%)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-[30svh] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.62)_42%,rgba(255,255,255,0.92)_100%)]" />

      <div className="relative mx-auto flex h-full w-full max-w-6xl items-center px-4 pb-[calc(8.75rem+env(safe-area-inset-bottom))] pt-[calc(7.25rem+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <div className="grid w-full gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="surface-panel rounded-[2.15rem] px-5 py-5 shadow-[0_44px_110px_-58px_rgba(8,28,20,0.44)] sm:px-6 sm:py-6">
            <EkiSignalMark compact />

            <div className="mt-5 max-w-xl">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
                Ekiti civic reporting
              </p>
              <h1 className="mt-2 text-[1.9rem] font-semibold leading-tight tracking-tight text-foreground sm:text-[2.25rem]">
                Report issues clearly and follow action without confusion.
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-[0.98rem]">
                Use EkiSignal to submit a report, track a case, and read notices for{" "}
                <span className="font-semibold text-foreground">{selectedArea}</span>.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="surface-muted rounded-[1.45rem] px-4 py-3.5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/68">
                  Current area
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{selectedArea}</p>
              </div>
              <div className="surface-muted rounded-[1.45rem] px-4 py-3.5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/68">
                  Open signals
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {summary.openSignals} active reports
                </p>
              </div>
              <div className="surface-muted rounded-[1.45rem] px-4 py-3.5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/68">
                  Resolved
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {summary.resolvedSignals} closed successfully
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href="/report/new"
                className={cn(buttonVariants({ size: "lg" }), "rounded-[1.35rem]")}
              >
                <FilePenLine data-icon="inline-start" />
                New report
              </Link>
              <Link
                href="/track"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-[1.35rem] border-white/70 bg-white/82"
                )}
              >
                <Ticket data-icon="inline-start" />
                Track report
              </Link>
              <Link
                href="/alerts"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-[1.35rem] border-white/70 bg-white/82"
                )}
              >
                <BellRing data-icon="inline-start" />
                Community notices
              </Link>
              <Link
                href={isAuthenticated ? "/account" : requestSignIn("/account")}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "rounded-[1.35rem]"
                )}
              >
                <ShieldCheck data-icon="inline-start" />
                {isAuthenticated ? "Open account" : "Sign in"}
              </Link>
            </div>
          </section>

          <section className="surface-panel flex flex-col rounded-[2.15rem] px-5 py-5 shadow-[0_44px_110px_-58px_rgba(8,28,20,0.36)] sm:px-6 sm:py-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-accent/18 text-foreground">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
                  Quick view
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                  Latest notices
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {summary.noticePreview.map((notice) => (
                <article key={notice.id} className="surface-muted rounded-[1.45rem] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{notice.title}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                        {notice.area}
                      </p>
                    </div>
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{notice.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-[1.55rem] border border-primary/12 bg-primary/[0.06] px-4 py-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/72">
                Keep it simple
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Start with a new report, or use your tracking number to follow an existing case.
              </p>
              <Link
                href="/about"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                About EkiSignal
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
