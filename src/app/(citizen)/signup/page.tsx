"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { PageShell } from "@/components/citizen/page-shell"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearReturnPath, hydrated, isAuthenticated, signUp } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const redirectPath = searchParams.get("redirect") ?? "/account"

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      clearReturnPath()
      router.replace(redirectPath)
    }
  }, [clearReturnPath, hydrated, isAuthenticated, redirectPath, router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await signUp({ fullName, email, phone, password })
    clearReturnPath()
    toast.success("Your EkiSignal account is ready.")
    router.replace(redirectPath)
  }

  return (
    <div className="px-4 pb-6 sm:px-6">
      <PageShell
        eyebrow="Create account"
        title="Create your civic account"
        description="Use a simple account so your reports, follow-up history, civic score, and verified leadership badge review stay attached to you."
      >
        <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <section className="surface-panel rounded-[2rem] px-5 py-5 shadow-soft sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="signup-name">Full name</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-phone">Phone number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className={cn(buttonVariants({ size: "lg" }), "w-full rounded-[1.2rem]")}
              >
                Create account
              </button>
            </form>

            <div className="mt-5 rounded-[1.4rem] border border-primary/14 bg-primary/[0.06] px-4 py-4">
              <p className="text-sm font-semibold text-foreground">Civic score is verified, not automatic</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                EkiSignal recognizes only genuine, moderated, evidence-backed reports. Duplicate, fake, or abusive submissions do not qualify.
              </p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="surface-panel rounded-[2rem] px-5 py-5 shadow-soft sm:px-6">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
                What you unlock
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  "Personal report history and status tracking.",
                  "Verified civic score and contribution badge progress.",
                  "Leadership badge history and moderation-backed eligibility status.",
                ].map((item) => (
                  <div key={item} className="surface-muted flex items-start gap-3 rounded-[1.35rem] px-4 py-3.5">
                    <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ShieldCheck className="size-4" />
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel rounded-[2rem] px-5 py-5 shadow-soft sm:px-6">
              <p className="text-sm font-semibold text-foreground">Already have an account?</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in and EkiSignal will return you to the page you originally intended to open.
              </p>
              <Link
                href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-4 rounded-[1.2rem]")}
              >
                Sign in instead
              </Link>
            </div>
          </section>
        </div>
      </PageShell>
    </div>
  )
}
