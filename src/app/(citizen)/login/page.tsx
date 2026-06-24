"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Ticket, Waypoints } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { EkiSignalMark } from "@/components/shared/ekisignal-mark"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearReturnPath, hydrated, isAuthenticated, signIn } = useAuth()
  const [email, setEmail] = useState("citizen@ekisignal.demo")
  const [password, setPassword] = useState("ekisignal-demo")
  const redirectPath = searchParams.get("redirect") ?? "/account"

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      clearReturnPath()
      router.replace(redirectPath)
    }
  }, [clearReturnPath, hydrated, isAuthenticated, redirectPath, router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await signIn({ email, password, role: "citizen" })
    clearReturnPath()
    toast.success("Signed in successfully.")
    router.replace(redirectPath)
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-[calc(6rem+env(safe-area-inset-top))] sm:px-6">
      <section className="surface-panel overflow-hidden rounded-[2.2rem] shadow-float">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <EkiSignalMark />
            <div className="mt-8">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/74">
                Citizen sign in
              </p>
              <h1 className="mt-3 font-heading text-[2rem] font-semibold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in to open your report history, civic score, saved location, and account
                settings.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="login-email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-14 rounded-[1.1rem] border-white/70 bg-white/80 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="login-password">Password</Label>
                  <Link href="/forgot-password" className="text-sm font-semibold text-primary">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-14 rounded-[1.1rem] border-white/70 bg-white/80 pl-10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={cn(buttonVariants({ size: "lg" }), "h-14 w-full rounded-[1.2rem]")}
              >
                Sign in
              </button>
            </form>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-[1.2rem] border-white/70 bg-white/78"
                )}
              >
                Create account
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "rounded-[1.2rem] text-primary"
                )}
              >
                Continue browsing
              </Link>
            </div>
          </div>

          <div className="hidden min-h-[32rem] border-l border-white/60 bg-[linear-gradient(135deg,rgba(17,93,69,0.1),rgba(255,255,255,0.98)_52%,rgba(217,173,69,0.18))] lg:block">
            <div className="relative flex h-full flex-col justify-between px-8 py-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(217,173,69,0.18),transparent_22%),radial-gradient(circle_at_26%_72%,rgba(17,93,69,0.16),transparent_24%)]" />
              <div className="relative ml-auto max-w-[19rem] rounded-[1.7rem] border border-white/64 bg-white/78 px-5 py-5 shadow-[0_40px_90px_-56px_rgba(8,28,20,0.42)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-[1rem] bg-primary text-primary-foreground">
                    <ShieldCheck className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Trusted civic access</p>
                    <p className="text-xs text-muted-foreground">
                      Secure account space for reports and recognition
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    "Track every report with a visible timeline",
                    "Open your civic score and leadership badges",
                    "Return to saved locations and account settings",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-[1.1rem] bg-primary/[0.05] px-3 py-3">
                      <ArrowRight className="size-4 text-primary" />
                      <p className="text-sm text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative grid gap-4">
                <div className="flex items-end gap-4">
                  <div className="surface-panel w-[13.5rem] rounded-[1.8rem] px-5 py-5 shadow-soft">
                    <div className="flex size-11 items-center justify-center rounded-[1.15rem] bg-primary/10 text-primary">
                      <Ticket className="size-5" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                      142 verified
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      reports supported in the latest transparency cycle
                    </p>
                  </div>
                  <div className="surface-panel w-[11.5rem] rounded-[1.8rem] px-5 py-5 shadow-soft">
                    <div className="flex size-11 items-center justify-center rounded-[1.15rem] bg-accent/20 text-accent-foreground">
                      <Waypoints className="size-5" />
                    </div>
                    <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                      17 desks
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      connected through live routing and moderation
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[2rem] font-semibold tracking-tight text-foreground">
                    Report clearly. Route properly. Track action.
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    EkiSignal keeps the sign-in flow simple and moves the real work into your
                    dashboard once you are inside.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
