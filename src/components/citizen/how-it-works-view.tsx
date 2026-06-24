"use client"

import Link from "next/link"
import { ArrowRight, BadgeCheck, Clock3, ScanSearch, SendToBack } from "lucide-react"

import { PageShell } from "@/components/citizen/page-shell"
import { reportingSteps } from "@/lib/demo-data"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const lifecycleStatuses = [
  "Received",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Rejected",
] as const

export function HowItWorksView() {
  return (
    <PageShell
      eyebrow="How It Works"
      title="A clear civic workflow from report to visible outcome"
      description="EkiSignal is designed so citizens can submit quickly while moderators and public offices still get the structure they need to act."
      actions={
        <Link
          href="/report/new"
          className={cn(buttonVariants({ size: "lg" }), "rounded-[1.25rem]")}
        >
          Start a new report
          <ArrowRight data-icon="inline-end" />
        </Link>
      }
    >
      <section className="surface-panel rounded-[1.95rem] p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[1.35rem] bg-primary/10 text-primary">
            <SendToBack className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Reporting in four steps</h2>
            <p className="text-sm text-muted-foreground">
              The citizen flow is kept short enough for a quick mobile session and strong enough
              for operational follow-up.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {reportingSteps.map((step, index) => (
            <div key={step.id} className="surface-muted rounded-[1.55rem] px-4 py-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/80">
                Step {index + 1}
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="rounded-[1.95rem] border-white/60 bg-white/88 shadow-soft">
          <CardHeader>
            <CardTitle>What happens after submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ScanSearch className="size-4.5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Moderation first</p>
                <p>
                  We check clarity, evidence, duplicates, abuse risk, and whether the location is
                  specific enough for action.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-accent/18 text-foreground">
                <Clock3 className="size-4.5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Routing and assignment</p>
                <p>
                  Category, LGA, ward, and routing rules decide which office or handler queue sees
                  the case next.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BadgeCheck className="size-4.5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Visible progress updates</p>
                <p>
                  Public-safe notes, status changes, and verified outcomes remain visible on the
                  tracking page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.95rem] border-white/60 bg-white/88 shadow-soft">
          <CardHeader>
            <CardTitle>Lifecycle transparency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {lifecycleStatuses.map((status) => (
                <Badge
                  key={status}
                  variant={status === "Rejected" ? "destructive" : status === "Resolved" || status === "Closed" ? "secondary" : "outline"}
                >
                  {status}
                </Badge>
              ))}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Citizens should never have to guess whether a report was received, routed, escalated,
              or closed. The product makes every stage scannable and timestamped.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
