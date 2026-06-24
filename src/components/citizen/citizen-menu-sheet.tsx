"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  House,
  LogOut,
  MapPinned,
  PanelLeftClose,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { citizenSecondaryLinks } from "@/components/citizen/citizen-navigation"
import { useAuth } from "@/hooks/use-auth"
import { usePwa } from "@/hooks/use-pwa"
import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface CitizenMenuSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  areaLabel: string
}

export function CitizenMenuSheet({
  open,
  onOpenChange,
  areaLabel,
}: CitizenMenuSheetProps) {
  const router = useRouter()
  const { canInstall, promptInstall } = usePwa()
  const { hydrated, isAuthenticated, logout, requestSignIn, session } = useAuth()
  const publicLinks = citizenSecondaryLinks.filter((item) => !item.requiresAuth)
  const memberLinks = citizenSecondaryLinks.filter((item) => item.requiresAuth)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        style={{ top: "calc(5.35rem + env(safe-area-inset-top))" }}
        className="w-[22rem] max-w-[calc(100vw-1rem)] rounded-r-[2rem] border-white/50 bg-[linear-gradient(180deg,rgba(249,250,245,0.98),rgba(242,246,239,0.96))] p-0 text-foreground shadow-[0_34px_110px_-56px_rgba(8,28,20,0.54)] backdrop-blur-2xl sm:w-[23.5rem] sm:max-w-[23.5rem]"
      >
        <SheetHeader className="border-b border-white/58 px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
                EkiSignal
              </p>
              <SheetTitle className="mt-2 text-left text-2xl font-semibold tracking-tight">
                Menu
              </SheetTitle>
              <SheetDescription className="mt-2 text-left leading-6">
                Simple navigation for EkiSignal.
              </SheetDescription>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-[1.15rem] bg-primary/10 px-3 py-2 text-[0.72rem] font-semibold text-primary">
                {areaLabel}
              </div>
              <button
                type="button"
                aria-label="Minimize menu"
                onClick={() => onOpenChange(false)}
                className="interactive-press inline-flex size-10 items-center justify-center rounded-[1.1rem] border border-white/68 bg-white/80 text-foreground shadow-[0_16px_34px_-26px_rgba(9,31,22,0.28)]"
              >
                <PanelLeftClose className="size-4.5" />
              </button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex h-full flex-col overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5">
          <div className="surface-panel rounded-[1.6rem] px-4 py-4 shadow-soft">
            {hydrated && isAuthenticated && session ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-primary text-primary-foreground">
                    <UserRound className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{session.fullName}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{session.email}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href="/account"
                    onClick={() => onOpenChange(false)}
                    className={cn(buttonVariants({ size: "lg" }), "rounded-[1.15rem]")}
                  >
                    Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      onOpenChange(false)
                      router.push("/")
                      toast.success("You have been signed out of EkiSignal.")
                    }}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "rounded-[1.15rem] border-white/70 bg-white/78"
                    )}
                  >
                    <LogOut data-icon="inline-start" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">
                  Continue browsing or sign in.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link
                    href={requestSignIn("/account")}
                    onClick={() => onOpenChange(false)}
                    className={cn(buttonVariants({ size: "lg" }), "rounded-[1.15rem]")}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/report/new"
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "rounded-[1.15rem] border-white/70 bg-white/78"
                    )}
                  >
                    Report now
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="mt-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/70">
              Main pages
            </p>
            <div className="mt-3 grid gap-2">
              <Link
                href="/"
                onClick={() => onOpenChange(false)}
                className="surface-muted interactive-press rounded-[1.25rem] px-4 py-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-primary/10 text-primary">
                    <House className="size-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Home</p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
              <Link
                href="/track"
                onClick={() => onOpenChange(false)}
                className="surface-muted interactive-press rounded-[1.25rem] px-4 py-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-primary/10 text-primary">
                    <MapPinned className="size-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Track report</p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
              <Link
                href="/about"
                onClick={() => onOpenChange(false)}
                className="surface-muted interactive-press rounded-[1.25rem] px-4 py-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-primary/10 text-primary">
                    <ShieldCheck className="size-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">About EkiSignal</p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/70">
              More pages
            </p>
            <div className="mt-3 grid gap-2">
              {publicLinks
                .filter((item) => item.href !== "/about" && item.href !== "/track")
                .map((item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className="surface-muted interactive-press rounded-[1.25rem] px-4 py-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-primary/10 text-primary">
                          <Icon className="size-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        </div>
                        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>

          {hydrated && isAuthenticated ? (
            <div className="mt-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/70">
                My account
              </p>
              <div className="mt-3 grid gap-2">
                {memberLinks.map((item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className="surface-muted interactive-press rounded-[1.25rem] px-4 py-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-primary/10 text-primary">
                          <Icon className="size-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        </div>
                        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-3">
            <Link
              href="/report/new"
              onClick={() => onOpenChange(false)}
              className="surface-panel interactive-press rounded-[1.25rem] px-4 py-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-[1.1rem] bg-accent/18 text-accent-foreground">
                  <MapPinned className="size-4.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">New report</p>
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>

            {canInstall ? (
              <button
                type="button"
                onClick={async () => {
                  const result = await promptInstall()

                  if (result === "accepted") {
                    toast.success("EkiSignal has been added to your device.")
                  } else if (result === "dismissed") {
                    toast.message("You can still install later from your browser menu.")
                  } else {
                    toast.message("Use your browser menu and choose Add to Home Screen.")
                  }

                  onOpenChange(false)
                }}
                className="surface-panel interactive-press rounded-[1.45rem] px-4 py-4 text-left shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-[1.1rem] bg-primary text-primary-foreground">
                    <Sparkles className="size-4.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Install EkiSignal</p>
                  </div>
                </div>
              </button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
