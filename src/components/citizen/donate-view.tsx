"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Coins, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react"

import { PageShell } from "@/components/citizen/page-shell"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { donationImpactStats, donationTiers, transparencySnapshots } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

const supportAreas = [
  {
    title: "Support verified citizen participation",
    body: "Help citizens submit well-documented reports and keep those reports visible through moderation and follow-up.",
  },
  {
    title: "Support moderation and accountability",
    body: "Fund the review, routing, storage, and oversight work that keeps reports from being buried or mishandled.",
  },
  {
    title: "Support civic recognition and leadership badges",
    body: "Back moderated badge recognition that celebrates genuine community contribution without encouraging spam.",
  },
] as const

export function DonateView() {
  const latestSnapshot = transparencySnapshots[0]

  return (
    <PageShell
      eyebrow="Donate"
      title="Support civic participation with a transparent, verified model"
      description="Donations help fund moderation, routing, public accountability, and carefully verified leadership badge recognition. The goal is credibility and impact, not gimmicks."
      actions={
        <div className="flex flex-wrap gap-3">
          <Link href="/transparency" className={cn(buttonVariants({ size: "lg" }), "rounded-[1.25rem]")}>
            Transparency ledger
            <ArrowRight data-icon="inline-end" />
          </Link>
          <a
            href="mailto:donors@ekisignal.demo"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-[1.25rem]")}
          >
            Donor contact
          </a>
        </div>
      }
    >
      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="surface-panel rounded-[2rem] p-5 shadow-soft sm:p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/78">
            Why donations matter
          </p>
          <h2 className="mt-3 text-[1.7rem] font-semibold tracking-tight text-foreground sm:text-[1.95rem]">
            Support a civic system people can actually trust
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            EkiSignal is strongest when citizens believe that their reports will be seen, routed,
            and followed through. Donor support helps fund the hard parts: moderation, storage,
            routing upkeep, public updates, and verified recognition oversight.
          </p>

          <div className="mt-5 grid gap-3">
            {supportAreas.map((item) => (
              <div key={item.title} className="surface-muted rounded-[1.5rem] px-4 py-4">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel rounded-[2rem] p-5 shadow-soft sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[1.7rem] border border-primary/14 bg-[linear-gradient(135deg,rgba(17,93,69,0.12),rgba(255,255,255,0.96)_58%,rgba(217,173,69,0.18))] p-5"
          >
            <div className="absolute right-0 top-0 h-28 w-28 bg-[radial-gradient(circle,rgba(217,173,69,0.28),transparent_70%)]" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/78">
                  Monthly impact
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                  {latestSnapshot.totalDonations}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Received in {latestSnapshot.month} across donor support and verified civic
                  participation funding.
                </p>
              </div>
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[1.35rem] bg-primary text-primary-foreground shadow-[0_24px_56px_-28px_rgba(17,93,69,0.62)]">
                <HeartHandshake className="size-6" />
              </div>
            </div>
          </motion.div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {donationImpactStats.map((stat) => (
              <div key={stat.id} className="surface-muted rounded-[1.45rem] px-4 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.55rem] border border-primary/14 bg-primary/[0.06] px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[1rem] bg-white/84 text-primary">
                <ShieldCheck className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Clean anti-fraud model</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  No donation creates automatic badges or instant perks. Verification, duplicate
                  checks, and moderation happen before any leadership badge decision is approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-panel rounded-[2rem] p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/78">
              Donation tiers
            </p>
            <h2 className="mt-2 text-[1.45rem] font-semibold tracking-tight text-foreground">
              Choose how you want to support
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              These cards show how donor support can map to moderation, verified participation, and
              badge recognition, and transparency work.
            </p>
          </div>
          <a
            href="mailto:donors@ekisignal.demo?subject=EkiSignal%20donor%20support"
            className={cn(buttonVariants({ size: "lg" }), "rounded-[1.15rem]")}
          >
            <Coins data-icon="inline-start" />
            Support EkiSignal
          </a>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {donationTiers.map((tier, index) => (
            <motion.article
              key={tier.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative overflow-hidden rounded-[1.8rem] border px-5 py-5 shadow-[0_26px_66px_-42px_rgba(9,31,22,0.28)]",
                index === 1
                  ? "border-primary/16 bg-[linear-gradient(180deg,rgba(17,93,69,0.08),rgba(255,255,255,0.94))]"
                  : "border-white/60 bg-white/88"
              )}
            >
              {index === 1 ? (
                <div className="absolute right-4 top-4 rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                  Recommended
                </div>
              ) : null}
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/78">
                {tier.title}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                {tier.amountLabel}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{tier.body}</p>
              <div className="mt-4 rounded-[1.3rem] bg-foreground/[0.04] px-3.5 py-3">
                <p className="text-sm font-semibold text-foreground">{tier.impactLabel}</p>
              </div>
              <a
                href={`mailto:donors@ekisignal.demo?subject=${encodeURIComponent(`Support ${tier.title}`)}`}
                className={cn(
                  buttonVariants({ variant: index === 1 ? "default" : "outline" }),
                  "mt-5 w-full rounded-[1.15rem]"
                )}
              >
                Pledge this tier
              </a>
            </motion.article>
          ))}
        </div>
      </section>

      <Card className="rounded-[2rem] border-white/60 bg-white/88 shadow-soft">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-[1.35rem] bg-accent/18 text-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Transparent support, not a vague donation story</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The ledger and monthly summaries are there so donors and citizens can see that
                support is tied to verified civic work, careful badge governance, and transparent operations.
              </p>
            </div>
          </div>
          <Link
            href="/transparency"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-[1.15rem]")}
          >
            View ledger
          </Link>
        </CardContent>
      </Card>
    </PageShell>
  )
}
