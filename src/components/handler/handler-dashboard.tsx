"use client"

import Link from "next/link"
import { ArrowUpRight, Building2, House, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { ReportTimeline } from "@/components/shared/report-timeline"
import { SeverityBadge, StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useReportCenter } from "@/hooks/use-report-center"
import { cn } from "@/lib/utils"

export function HandlerDashboard() {
  const { reports } = useReportCenter()
  const assignedReports = reports
    .filter(
      (report) =>
        report.assignedOfficeName.includes("Water") ||
        report.assignedOfficeName.includes("Works") ||
        report.assignedOfficeName.includes("Environmental")
    )
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,92,67,0.12),transparent_26%),linear-gradient(180deg,#f7f7f1,#eef3ee)] px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_34px_100px_-54px_rgba(8,28,20,0.5)] backdrop-blur lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
              Handler workspace
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground">
              Assigned government queue
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              A simplified, mobile-usable dashboard for the office or handler responsible for a live queue of civic tickets.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-[1.2rem]"
              )}
            >
              <ShieldCheck data-icon="inline-start" />
              Open admin
            </Link>
            <Link
              href="/"
              className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
            >
              <House data-icon="inline-start" />
              Back to citizen app
            </Link>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-2">
          {assignedReports.map((report) => (
            <Card key={report.id} className="rounded-[1.8rem] border-white/60 bg-white/82">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={report.status} />
                  <SeverityBadge severity={report.severity} />
                </div>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>
                  {report.trackingNumber} • {report.location.community}, {report.location.lga}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[1.25rem] bg-foreground/[0.04] px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {report.description}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => toast.success("Status update action reserved for backend wiring.")}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "justify-start rounded-[1.15rem]"
                    )}
                  >
                    <ArrowUpRight data-icon="inline-start" />
                    Update progress
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success("Escalation action reserved for backend wiring.")}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "justify-start rounded-[1.15rem]"
                    )}
                  >
                    <Building2 data-icon="inline-start" />
                    Escalate upward
                  </button>
                </div>
                <ReportTimeline updates={report.updates} />
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}
