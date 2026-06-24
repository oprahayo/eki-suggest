"use client"

import Link from "next/link"
import { useEffect } from "react"
import {
  BellRing,
  CalendarDays,
  CircleHelp,
  Coins,
  HeartHandshake,
  LogOut,
  MapPin,
  NotebookPen,
  Settings2,
  ShieldCheck,
  Smartphone,
  Trophy,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { PageShell } from "@/components/citizen/page-shell"
import { PwaInstallCard } from "@/components/pwa/pwa-install-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useReportCenter } from "@/hooks/use-report-center"
import { civicProfile, civicRewardHistory } from "@/lib/demo-data"
import { formatLagosTimestamp } from "@/lib/dates"
import { cn } from "@/lib/utils"

const signedInLinks = [
  {
    href: "/my-reports",
    label: "Report history",
    helper: "Open your tracked reports, saved drafts, and verified outcomes.",
    icon: NotebookPen,
  },
  {
    href: "/settings",
    label: "Settings",
    helper: "Manage saved area, alerts, install behavior, and privacy controls.",
    icon: Settings2,
  },
  {
    href: "/help",
    label: "Help and FAQ",
    helper: "Support guidance, emergency disclaimer, and privacy answers.",
    icon: CircleHelp,
  },
  {
    href: "/about",
    label: "About EkiSignal",
    helper: "Understand the routing, tracking, and trust model behind the platform.",
    icon: HeartHandshake,
  },
  {
    href: "/rewards",
    label: "Civic Score",
    helper: "See verified contribution rules, badge tiers, and leadership review progress.",
    icon: Trophy,
  },
  {
    href: "/transparency",
    label: "Transparency",
    helper: "Review donor support, leadership badge summaries, and monthly public reporting.",
    icon: Coins,
  },
] as const

export function AccountView() {
  const router = useRouter()
  const { hydrated, isAuthenticated, logout, requestSignIn, session } = useAuth()
  const { selectedArea } = useReportCenter()
  const scoreProgress = Math.min(
    (civicProfile.civicScore / civicProfile.nextTierScore) * 100,
    100
  )

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace(requestSignIn("/account"))
    }
  }, [hydrated, isAuthenticated, requestSignIn, router])

  if (!hydrated) {
    return (
      <PageShell
        eyebrow="Citizen account"
        title="Loading your civic account"
        description="Preparing your account summary, saved area, and civic contribution view."
      >
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <Skeleton className="h-[28rem] rounded-[1.95rem]" />
          <Skeleton className="h-[28rem] rounded-[1.95rem]" />
        </div>
      </PageShell>
    )
  }

  if (hydrated && !isAuthenticated) {
    return (
      <PageShell
        eyebrow="Citizen account"
        title="Sign in"
        description="Redirecting you to the secure sign-in form for your dashboard and account history."
      >
        <div className="mx-auto w-full max-w-md">
          <Skeleton className="h-64 rounded-[1.95rem]" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Citizen account"
      title="Profile and civic dashboard"
      description="Manage your account, civic score, leadership badges, saved location, and support tools in one clean citizen workspace."
    >
      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="surface-panel overflow-hidden rounded-[2rem] shadow-soft">
          <div className="bg-[linear-gradient(180deg,#115d45,#0d4c37)] px-5 py-5 text-primary-foreground sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback>
                    {session?.fullName
                      ?.split(" ")
                      .slice(0, 2)
                      .map((segment) => segment.charAt(0))
                      .join("")
                      .toUpperCase() || "ES"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xl font-semibold tracking-tight">
                    {session?.fullName || civicProfile.fullName}
                  </p>
                  <p className="mt-1 text-sm text-primary-foreground/78">
                    {session?.email || "citizen@ekisignal.demo"}
                  </p>
                  <div className="mt-3 inline-flex rounded-full bg-white/12 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white">
                    {civicProfile.trustTier}
                  </div>
                </div>
              </div>
              <Link
                href="/settings"
                className="rounded-[1rem] bg-white/12 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/18"
              >
                Manage profile
              </Link>
            </div>
          </div>

          <div className="space-y-6 px-5 py-5 sm:px-6">
            <section>
              <p className="text-base font-semibold text-foreground">Personal information</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Full name</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {session?.fullName || civicProfile.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email address</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {session?.email || "citizen@ekisignal.demo"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Saved location</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MapPin className="size-4 text-primary" />
                    {session?.defaultLocation || selectedArea}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Member since</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarDays className="size-4 text-primary" />
                    {formatLagosTimestamp(session?.memberSince || civicProfile.memberSince)}
                  </p>
                </div>
              </div>
            </section>

            <div className="soft-divider border-t" />

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Civic score", value: civicProfile.civicScore.toString() },
                { label: "Verified reports", value: civicProfile.verifiedReports.toString() },
                { label: "Leadership badges", value: civicProfile.rewardsEarned },
                { label: "Reports resolved", value: civicProfile.reportsResolved.toString() },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    "rounded-[1.4rem] px-4 py-4",
                    index === 0
                      ? "border border-primary/14 bg-primary/[0.06]"
                      : "surface-muted"
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </section>

            <div className="rounded-[1.55rem] border border-primary/14 bg-primary/[0.06] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary/75">
                    Score progress
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    {civicProfile.civicScore}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {civicProfile.nextTierScore - civicProfile.civicScore} points to the next
                    contribution tier
                  </p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-[1.35rem] bg-white/82 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]">
                  <Trophy className="size-5" />
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/82 shadow-[inset_0_1px_2px_rgba(9,31,22,0.08)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#0f5c43,#d9ad45)]"
                  style={{ width: `${scoreProgress}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {civicProfile.impactSummary}
              </p>
            </div>

            <div className="soft-divider border-t" />

            <section className="space-y-3">
              <p className="text-base font-semibold text-foreground">Shortcuts</p>
              <div className="grid gap-3">
                {signedInLinks.map((item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="surface-muted interactive-press flex items-start justify-between gap-3 rounded-[1.35rem] px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-10 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
                          <Icon className="size-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.helper}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-primary">Open</span>
                    </Link>
                  )
                })}
              </div>
            </section>

            <button
              type="button"
              onClick={() => {
                logout()
                router.push("/")
                toast.success("You have been signed out of EkiSignal.")
              }}
              className={cn(buttonVariants({ size: "lg" }), "w-full rounded-[1.2rem]")}
            >
              <LogOut data-icon="inline-start" />
              Logout
            </button>
          </div>
        </section>

        <div className="space-y-5">
          <section className="surface-panel rounded-[2rem] px-5 py-5 shadow-soft sm:px-6">
            <p className="text-base font-semibold text-foreground">Recent badge decisions</p>
            <div className="mt-4 space-y-3">
              {civicRewardHistory.map((entry) => (
                <div key={entry.id} className="surface-muted rounded-[1.45rem] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {entry.reportTrackingNumber ?? "No linked ticket"}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                      {entry.points} pts
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.note}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{entry.state.replaceAll("_", " ")}</span>
                    <span>{entry.amountLabel ?? formatLagosTimestamp(entry.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-panel rounded-[2rem] px-5 py-5 shadow-soft sm:px-6">
            <p className="text-base font-semibold text-foreground">Support and device readiness</p>
            <div className="mt-4 space-y-3">
              <div className="surface-muted rounded-[1.45rem] px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BellRing className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Alerts stay visible</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Assignment updates, community notices, and badge review changes stay grouped
                      in one alert center.
                    </p>
                  </div>
                </div>
              </div>

              <div className="surface-muted rounded-[1.45rem] px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/18 text-foreground">
                    <Smartphone className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Installable mobile shell</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Add EkiSignal to your home screen for faster repeat access and safer
                      reporting on weak networks.
                    </p>
                  </div>
                </div>
              </div>

              <div className="surface-muted rounded-[1.45rem] px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ShieldCheck className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Privacy and controls</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Review privacy guidance, update your saved area, or change account
                      preferences from settings.
                    </p>
                  </div>
                </div>
              </div>

              <PwaInstallCard />
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  )
}
