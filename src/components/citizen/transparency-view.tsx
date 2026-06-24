"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowDownToLine,
  ArrowRight,
  FileChartColumnIncreasing,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
} from "lucide-react"

import { PageShell } from "@/components/citizen/page-shell"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  anonymizedRewardPayouts,
  transparencyImpactCards,
  transparencyLedger,
  transparencySnapshots,
  transparencyTotals,
} from "@/lib/demo-data"
import { formatLagosTimestamp } from "@/lib/dates"
import { cn } from "@/lib/utils"

const monthlyBarMeta = [
  { id: "snapshot-mar", donationsWidth: "100%", rewardsWidth: "74%" },
  { id: "snapshot-feb", donationsWidth: "81%", rewardsWidth: "56%" },
] as const

export function TransparencyView() {
  return (
    <PageShell
      eyebrow="Transparency Ledger"
      title="Show support, leadership badges, and impact in a credible public ledger"
      description="This page is where citizens and donors should see how support is used, how verified badge recognition is handled, and why privacy and anti-fraud checks remain part of the system."
      actions={
        <div className="flex flex-wrap gap-3">
          <Link href="/donate" className={cn(buttonVariants({ size: "lg" }), "rounded-[1.25rem]")}>
            Support the platform
            <ArrowRight data-icon="inline-end" />
          </Link>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-[1.25rem]")}
          >
            <ArrowDownToLine data-icon="inline-start" />
            Monthly report card
          </button>
        </div>
      }
    >
      <section className="surface-panel rounded-[2rem] p-5 shadow-soft sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.5rem] border border-primary/12 bg-primary/[0.06] px-4 py-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/78">
              Total donations received
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {transparencyTotals.totalDonationsReceived}
            </p>
          </div>
          <div className="surface-muted rounded-[1.5rem] px-4 py-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Leadership badges issued
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {transparencyTotals.totalRewardsPaidOut}
            </p>
          </div>
          <div className="surface-muted rounded-[1.5rem] px-4 py-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Verified reports supported
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {transparencyTotals.totalVerifiedReportsSupported}
            </p>
          </div>
          <div className="surface-muted rounded-[1.5rem] px-4 py-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Contributors recognized
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {transparencyTotals.totalCitizensRewarded}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="surface-panel rounded-[2rem] p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[1.35rem] bg-primary/10 text-primary">
              <FileChartColumnIncreasing className="size-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/78">
                Monthly summaries
              </p>
              <h2 className="mt-1 text-[1.4rem] font-semibold tracking-tight text-foreground">
                Transparent cycles, not hidden numbers
              </h2>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {transparencySnapshots.map((snapshot) => {
              const barMeta = monthlyBarMeta.find((item) => item.id === snapshot.id)

              return (
                <motion.article
                  key={snapshot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="surface-muted rounded-[1.6rem] px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{snapshot.month}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {snapshot.moderationCoverage}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/84 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                      Published {formatLagosTimestamp(snapshot.publishedAt)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>Donations received</span>
                        <span>{snapshot.totalDonations}</span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-foreground/[0.05]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#115d45,#1b7d5f)]"
                          style={{ width: barMeta?.donationsWidth ?? "100%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>Badges issued</span>
                        <span>{snapshot.rewardsDisbursed}</span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-foreground/[0.05]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#d9ad45,#e6c269)]"
                          style={{ width: barMeta?.rewardsWidth ?? "60%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-white/78 px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Contributors recognized
                      </p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {snapshot.citizensRewarded}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white/78 px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Verified reports supported
                      </p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {snapshot.verifiedReportsSupported}
                      </p>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>

        <div className="space-y-5">
          <Card className="rounded-[2rem] border-white/60 bg-white/88 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[1.05rem]">
                <WalletCards className="size-5 text-primary" />
                Anonymized recent leadership badges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {anonymizedRewardPayouts.map((entry) => (
                <div key={entry.id} className="surface-muted rounded-[1.5rem] px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.recipientLabel}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{entry.area}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                      {entry.amountLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.reason}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatLagosTimestamp(entry.createdAt)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/60 bg-white/88 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[1.05rem]">
                <LockKeyhole className="size-5 text-primary" />
                Trust message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                We publish enough information to prove system integrity, but not enough to expose a
                citizen&apos;s private identity.
              </p>
              <p>
                Leadership badge recognition depends on moderation, verification, duplicate checks,
                and approval rules. Donor support never overrides those safeguards.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[2rem] border-white/60 bg-white/88 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[1.05rem]">
              <ShieldCheck className="size-5 text-primary" />
              Impact cards
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {transparencyImpactCards.map((card) => (
              <div key={card.id} className="surface-muted rounded-[1.5rem] px-4 py-4">
                <p className="text-sm font-semibold text-foreground">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/60 bg-white/88 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[1.05rem]">
              <ArrowDownToLine className="size-5 text-primary" />
              Ledger activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transparencyLedger.map((entry) => (
              <div key={entry.id} className="surface-muted rounded-[1.45rem] px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                  {entry.amountLabel ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                      {entry.amountLabel}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.body}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatLagosTimestamp(entry.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-[2rem] border border-primary/12 bg-[linear-gradient(135deg,rgba(17,93,69,0.1),rgba(255,255,255,0.92)_64%,rgba(217,173,69,0.14))] px-5 py-5 shadow-[0_30px_80px_-46px_rgba(9,31,22,0.28)] sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/78">
              Public integrity
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              Transparency should make the product feel credible, not exposed
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              The ledger is designed to show real support, verified recognition, and public impact
              without leaking sensitive case notes or personal identity.
            </p>
          </div>
          <Link href="/donate" className={cn(buttonVariants({ size: "lg" }), "rounded-[1.15rem]")}>
            Support EkiSignal
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
