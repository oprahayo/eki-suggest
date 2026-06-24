"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowRight,
  Coins,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react"

import { AuthRequiredCard } from "@/components/citizen/auth-required-card"
import { PageShell } from "@/components/citizen/page-shell"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import {
  civicProfile,
  civicRewardHistory,
  civicScoreRules,
  civicScoreWarnings,
} from "@/lib/demo-data"
import { formatLagosTimestamp } from "@/lib/dates"
import { cn } from "@/lib/utils"

const rewardStateLabel = {
  rewarded: "Badge awarded",
  eligible: "Eligible after review",
  under_review: "Under review",
  not_eligible: "No badge",
} as const

const tierProgress = Math.min((civicProfile.civicScore / civicProfile.nextTierScore) * 100, 100)

function ScoreOrb() {
  return (
    <div className="relative mx-auto flex size-[12.75rem] items-center justify-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#115d45 0 ${tierProgress}%, rgba(17,93,69,0.08) ${tierProgress}% 100%)`,
        }}
      />
      <div className="absolute inset-[14px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,247,241,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.64)]" />
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-[1.3rem] bg-primary text-primary-foreground shadow-[0_24px_50px_-26px_rgba(17,93,69,0.62)]">
          <Trophy className="size-6" />
        </div>
        <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary/80">
          Civic score
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          {civicProfile.civicScore}
        </p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {civicProfile.trustTier}
        </p>
      </motion.div>
    </div>
  )
}

export function RewardsView() {
  const { hydrated, isAuthenticated } = useAuth()

  if (!hydrated) {
    return (
        <PageShell
        eyebrow="Civic Score"
        title="Loading your civic score"
        description="Preparing verified contribution history and leadership badge review details."
      >
        <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <Skeleton className="h-[22rem] rounded-[2rem]" />
          <Skeleton className="h-[22rem] rounded-[2rem]" />
        </div>
        <Skeleton className="h-[22rem] rounded-[2rem]" />
      </PageShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <PageShell
        eyebrow="Civic Score"
        title="Sign in to view your civic score and badge history"
        description="Public trust pages stay open without login, but personal civic score, leadership badge review, and verified participation history now live behind your account."
      >
        <AuthRequiredCard
          title="Open your account to see personal civic score progress"
          description="Civic score is a personal, verified participation record. Sign in to view your score, badge review status, and contribution history without exposing private account details publicly."
        />
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Civic Score"
      title="Recognize genuine civic contribution with leadership badges"
      description="Citizens can build civic score when a report is real, clear, and verified. The system is designed to recognize quality and honesty, not spam or volume."
      actions={
        <div className="flex flex-wrap gap-3">
          <Link href="/report/new" className={cn(buttonVariants({ size: "lg" }), "rounded-[1.25rem]")}>
            New report
            <ArrowRight data-icon="inline-end" />
          </Link>
          <Link
            href="/transparency"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-[1.25rem]")}
          >
            Transparency ledger
          </Link>
        </div>
      }
    >
      <section className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="surface-panel rounded-[2rem] p-5 shadow-soft sm:p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/78">
            Current profile
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
            <ScoreOrb />
            <div className="space-y-4">
              <div className="rounded-[1.55rem] border border-primary/12 bg-primary/[0.06] px-4 py-4">
                <p className="text-sm font-semibold text-foreground">Badge level</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {civicProfile.trustTier}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {civicProfile.nextTierScore - civicProfile.civicScore} more points to the next
                  contribution tier.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface-muted rounded-[1.4rem] px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Verified reports
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {civicProfile.verifiedReports}
                  </p>
                </div>
                <div className="surface-muted rounded-[1.4rem] px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Leadership badge review
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {civicProfile.rewardEligibleCount > 0
                      ? `${civicProfile.rewardEligibleCount} report${civicProfile.rewardEligibleCount === 1 ? "" : "s"} in badge review`
                      : "No active badge review"}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {civicProfile.impactSummary}
              </p>
            </div>
          </div>
        </div>

        <div className="surface-panel rounded-[2rem] p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[1.25rem] bg-accent/20 text-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/78">
                Eligibility rules
              </p>
              <h2 className="mt-1 text-[1.35rem] font-semibold tracking-tight text-foreground">
                How points are earned
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {civicScoreRules.map((rule) => (
              <div key={rule.id} className="surface-muted rounded-[1.5rem] px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{rule.title}</p>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                    {rule.pointsLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{rule.body}</p>
              </div>
            ))}
          </div>

          <div className="surface-accent mt-4 rounded-[1.55rem] px-4 py-4 text-accent-foreground">
            <div className="flex items-start gap-3">
              <div className="icon-accent flex size-10 shrink-0 items-center justify-center rounded-[1rem]">
                <AlertTriangle className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Why fake or duplicate reports do not qualify
                </p>
                <div className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                  {civicScoreWarnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-panel rounded-[2rem] p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/78">
              Leadership badge history
            </p>
            <h2 className="mt-2 text-[1.4rem] font-semibold tracking-tight text-foreground">
              Recent recognition decisions
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Every recognition state should be explainable, timestamped, and tied to a verified public
              issue or follow-up confirmation.
            </p>
          </div>
          <Link
            href="/donate"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-[1.15rem]")}
          >
            <Coins data-icon="inline-start" />
            See donor support
          </Link>
        </div>

        <div className="mt-5 grid gap-3">
          {civicRewardHistory.map((entry) => (
            <div key={entry.id} className="surface-muted rounded-[1.55rem] px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                    <span className="rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {rewardStateLabel[entry.state]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.reportTrackingNumber ?? "No linked ticket"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                    {entry.points} pts
                  </span>
                  {entry.amountLabel ? (
                    <p className="mt-2 text-sm font-semibold text-foreground">{entry.amountLabel}</p>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{entry.note}</p>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{formatLagosTimestamp(entry.createdAt)}</span>
                <span>Verification-first recognition flow</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Card className="rounded-[2rem] border-white/60 bg-white/88 shadow-soft">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-[1.35rem] bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Leadership badges are part of the trust model, not a shortcut around moderation
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The goal is to strengthen honest civic participation, spotlight reliable contributors,
                and keep recognition tied to evidence and verification.
              </p>
            </div>
          </div>
          <Link href="/transparency" className={cn(buttonVariants({ size: "lg" }), "rounded-[1.15rem]")}>
            Transparency ledger
          </Link>
        </CardContent>
      </Card>
    </PageShell>
  )
}
