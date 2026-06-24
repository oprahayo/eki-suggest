"use client"

import Link from "next/link"
import { useTransition } from "react"
import { BellRing, LocateFixed, LogOut, MapPinned, ShieldCheck, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AuthRequiredCard } from "@/components/citizen/auth-required-card"
import { PageShell } from "@/components/citizen/page-shell"
import { PwaInstallCard } from "@/components/pwa/pwa-install-card"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useReportCenter } from "@/hooks/use-report-center"
import { ekitiLgas } from "@/lib/ekiti"
import { cn } from "@/lib/utils"

export function SettingsView() {
  const router = useRouter()
  const { hydrated, isAuthenticated, logout, session, updateProfile } = useAuth()
  const { selectedArea, locationPreference, saveManualLocation, requestDeviceLocation } =
    useReportCenter()
  const [isUpdatingLocation, startLocationUpdate] = useTransition()

  if (!hydrated) {
    return (
      <PageShell
        eyebrow="Settings"
        title="Loading your settings"
        description="Preparing saved area, privacy controls, and install preferences."
      >
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <Skeleton className="h-[26rem] rounded-[1.95rem]" />
          <Skeleton className="h-[26rem] rounded-[1.95rem]" />
        </div>
      </PageShell>
    )
  }

  if (hydrated && !isAuthenticated) {
    return (
      <PageShell
        eyebrow="Settings"
        title="Settings and privacy controls"
        description="Sign in before changing your saved area, account preferences, install behavior, or privacy settings."
      >
        <AuthRequiredCard
          title="Sign in to manage your EkiSignal settings"
          description="Settings covers your saved default area, personal account details, install guidance, and privacy controls. Public browsing and public report tracking still stay open without an account."
        />
      </PageShell>
    )
  }

  return (
    <PageShell
      eyebrow="Settings"
      title="Privacy, saved area, and device preferences"
      description="Keep your default location, notification expectations, install guidance, and account controls steady in one civic settings space."
    >
      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <Card className="rounded-[1.95rem] border-white/60 bg-white/88 shadow-soft">
            <CardHeader>
              <CardTitle>Saved profile details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="settings-full-name">Full name</Label>
                <Input
                  id="settings-full-name"
                  defaultValue={session?.fullName}
                  onBlur={(event) => updateProfile({ fullName: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input id="settings-email" value={session?.email ?? ""} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="settings-phone">Phone number</Label>
                <Input
                  id="settings-phone"
                  defaultValue={session?.phone}
                  onBlur={(event) => updateProfile({ phone: event.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Saved default area</Label>
                <Select
                  value={selectedArea}
                  onValueChange={(value) => {
                    if (value) {
                      saveManualLocation({ label: value })
                      updateProfile({ defaultLocation: value })
                      toast.success("Saved area updated for your civic shell.")
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your default area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Ado-Ekiti, Nigeria">Ado-Ekiti, Nigeria</SelectItem>
                      {ekitiLgas.map((lga) => (
                        <SelectItem key={lga.name} value={`${lga.headquarters}, Nigeria`}>
                          {lga.headquarters}, Nigeria
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-xs leading-5 text-muted-foreground">
                  {locationPreference.permission === "granted" &&
                  locationPreference.coordinates
                    ? "Your last approved live location is saved locally and used as the default map focus until you change it."
                    : locationPreference.permission === "denied"
                      ? "Device location has been denied, so EkiSignal will keep using your manual saved area until you choose otherwise."
                      : "EkiSignal uses this saved area whenever live location is unavailable or not requested."}
                </p>
              </div>
              <div className="surface-muted rounded-[1.4rem] px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Device location memory</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      EkiSignal only checks device location when you tap the button below. It does not ask again on every visit.
                    </p>
                  </div>
                  <span className="rounded-full bg-white/88 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]">
                    {locationPreference.permission === "granted"
                      ? "granted"
                      : locationPreference.permission === "denied"
                        ? "manual fallback"
                        : "not requested"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    disabled={isUpdatingLocation}
                    onClick={() =>
                      startLocationUpdate(async () => {
                        const result = await requestDeviceLocation({
                          force: true,
                          fallbackLabel: selectedArea,
                        })

                        if (result.status === "granted") {
                          toast.success("Saved live location updated.")
                          return
                        }

                        toast.message(
                          "Device location is unavailable, so your saved manual area will stay active."
                        )
                      })
                    }
                    className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                  >
                    <LocateFixed data-icon="inline-start" />
                    {isUpdatingLocation ? "Checking location..." : "Use current location"}
                  </button>
                  <span className="rounded-full bg-white/80 px-3 py-2 text-xs text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]">
                    Last location label: {selectedArea}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.95rem] border-white/60 bg-white/88 shadow-soft">
            <CardHeader>
              <CardTitle>Account controls</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                {
                  title: "Alerts and public updates",
                  body: "Status changes, community notices, and leadership badge review notes stay visible in the alert center.",
                  icon: BellRing,
                },
                {
                  title: "Saved area fallback",
                  body: "If live location is unavailable, EkiSignal can still fall back to your saved area instead of blocking reporting.",
                  icon: MapPinned,
                },
                {
                  title: "Privacy and account security",
                  body: "Public browsing remains open, while personal report history, score, and badge data stay behind sign-in.",
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.title} className="surface-muted rounded-[1.4rem] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-[1.15rem] bg-primary/10 text-primary">
                        <Icon className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="rounded-[1.95rem] border-white/60 bg-white/88 shadow-soft">
            <CardHeader>
              <CardTitle>Install and launch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="surface-muted rounded-[1.4rem] px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-[1.15rem] bg-accent/18 text-accent-foreground">
                    <Sparkles className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Keep install prompts calm</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      EkiSignal only prompts for install when it is useful, and you can still add it later from your browser menu.
                    </p>
                  </div>
                </div>
              </div>
              <PwaInstallCard />
            </CardContent>
          </Card>

          <Card className="rounded-[1.95rem] border-white/60 bg-white/88 shadow-soft">
            <CardHeader>
              <CardTitle>Support and privacy</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link
                href="/help"
                className="surface-muted interactive-press rounded-[1.4rem] px-4 py-4"
              >
                <p className="text-sm font-semibold text-foreground">Help / FAQ</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Read support answers, privacy guidance, emergency disclaimers, and contact routes.
                </p>
              </Link>
              <Link
                href="/transparency"
                className="surface-muted interactive-press rounded-[1.4rem] px-4 py-4"
              >
                <p className="text-sm font-semibold text-foreground">Transparency</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Review donor support, verified badge summaries, and the public anti-fraud model.
                </p>
              </Link>
            </CardContent>
          </Card>

          <button
            type="button"
            onClick={() => {
              logout()
              router.push("/")
              toast.success("You have been signed out of EkiSignal.")
            }}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full justify-start rounded-[1.2rem] border-white/70 bg-white/78"
            )}
          >
            <LogOut data-icon="inline-start" />
            Logout
          </button>
        </div>
      </div>
    </PageShell>
  )
}
