"use client"

import Link from "next/link"
import { ArrowUpRight, Coins, ShieldAlert, ShieldCheck, Siren, TimerReset, Trophy } from "lucide-react"

import { PageShell } from "@/components/citizen/page-shell"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { faqs } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

export function HelpView() {
  return (
    <PageShell
      eyebrow="Help"
      title="FAQ, privacy, and emergency guidance"
      description="The platform should feel transparent before, during, and after a report is submitted. This page keeps the ground rules visible."
    >
      <Alert
        id="emergency"
        className="surface-danger rounded-[1.9rem] text-red-700"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <Siren className="size-4.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">Emergency-first guidance</p>
            <p className="mt-1 text-sm leading-6 text-red-700/88">
              Use emergency services first for active threats, medical emergencies, or situations
              that require immediate intervention. EkiSignal improves routing and accountability,
              but it is not a 24/7 emergency dispatch system.
            </p>
          </div>
        </div>
      </Alert>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="surface-panel rounded-[1.9rem] px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Before you submit</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  These reminders keep the platform useful, fair, and trusted.
                </p>
              </div>
              <Badge variant="secondary">Citizen-safe</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Be factual",
                  body: "Use clear details, photos, and context instead of speculation.",
                },
                {
                  icon: TimerReset,
                  title: "Track progress",
                  body: "Keep your ticket number so you can follow every update later.",
                },
                {
                  icon: ArrowUpRight,
                  title: "Use the right channel",
                  body: "Emergency threats should still go through emergency lines first.",
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.title} className="surface-muted rounded-[1.45rem] px-4 py-4">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                      <Icon className="size-4.5" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {faqs.map((faq) => (
            <Card key={faq.id} className="rounded-[1.85rem] border-white/60 bg-white/86 shadow-soft">
              <CardHeader>
                <CardTitle>{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-5">
          <Card className="rounded-[1.85rem] border-white/60 bg-white/86 shadow-soft">
            <CardHeader>
              <CardTitle>Trust commitments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Reports are timestamped, routed with explicit logic, and designed to carry a
                visible status trail.
              </p>
              <p>
                Moderation exists to protect the system from abuse, not to bury valid citizen
                complaints.
              </p>
              <p>
                When public-safe, assigned offices and update notes appear on the tracking page to
                reinforce transparency.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[1.85rem] border-white/60 bg-white/86 shadow-soft">
            <CardHeader>
              <CardTitle>Next step</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                If you already know the issue, jump straight back into the multi-step report flow.
              </p>
              <Link
                href="/report/new"
                className={cn(buttonVariants({ size: "lg" }), "rounded-[1.25rem]")}
              >
                <ShieldAlert data-icon="inline-start" />
                Start report flow
              </Link>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/rewards"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start rounded-[1.2rem]"
                  )}
                >
                  <Trophy data-icon="inline-start" />
                  Leadership badges
                </Link>
                <Link
                  href="/transparency"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start rounded-[1.2rem]"
                  )}
                >
                  <Coins data-icon="inline-start" />
                  Transparency
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
