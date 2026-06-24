"use client"

import Link from "next/link"
import { ArrowRight, LifeBuoy, MapPinned, ShieldCheck, Ticket } from "lucide-react"

import { PageShell } from "@/components/citizen/page-shell"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const steps = [
  {
    title: "Report what you see",
    body: "Choose the issue, add the location, and send clear details from your phone.",
    icon: MapPinned,
  },
  {
    title: "We route it properly",
    body: "EkiSignal sends the case to the right moderation desk or public office.",
    icon: ShieldCheck,
  },
  {
    title: "Track progress clearly",
    body: "Use your tracking number to follow updates until the case is resolved or closed.",
    icon: Ticket,
  },
] as const

export function AboutView() {
  return (
    <PageShell
      eyebrow="About EkiSignal"
      title="A simple way to report public issues in Ekiti State"
      description="EkiSignal helps citizens report issues, routes each case to the right office, and keeps progress visible without confusion."
      actions={
        <div className="flex flex-wrap gap-3">
          <Link
            href="/report/new"
            className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
          >
            New report
            <ArrowRight data-icon="inline-end" />
          </Link>
          <Link
            href="/track"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-[1.2rem] border-white/70 bg-white/80"
            )}
          >
            Track report
          </Link>
        </div>
      }
    >
      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-panel rounded-[1.9rem] px-5 py-5 shadow-soft sm:px-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            What EkiSignal is
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            EkiSignal is a civic reporting platform for Ekiti State. It helps residents report bad
            roads, drainage problems, water issues, sanitation concerns, public service delays, and
            similar community problems in a structured way.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            The goal is simple: make sure reports are not lost, make sure they reach the right
            office, and make sure citizens can follow what happens next.
          </p>
        </div>

        <div className="surface-panel rounded-[1.9rem] px-5 py-5 shadow-soft sm:px-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Why it exists
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Too many public issues disappear in scattered chats, social media posts, or verbal
            complaints. EkiSignal creates one clear place to report, route, and track action.
          </p>
          <div className="mt-4 rounded-[1.45rem] border border-primary/12 bg-primary/[0.05] px-4 py-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/75">
              Trust promise
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Every report gets a clear status, and every official action leaves a visible record.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-panel rounded-[1.9rem] px-5 py-5 shadow-soft sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          How it works
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <div key={step.title} className="surface-muted rounded-[1.45rem] px-4 py-4">
                <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/70">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="surface-panel rounded-[1.9rem] px-5 py-5 shadow-soft sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-accent/18 text-foreground">
            <LifeBuoy className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Need help?
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              If you need support, want to understand tracking better, or need help submitting a
              report, open the Help page or contact the support team from inside the app.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/help"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-[1.2rem] border-white/70 bg-white/80"
                )}
              >
                Help / FAQ
              </Link>
              <Link
                href="/alerts"
                className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
              >
                Community notices
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
