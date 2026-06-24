"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { Mail, ShieldCheck } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { PageShell } from "@/components/citizen/page-shell"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const redirectPath = searchParams.get("redirect") ?? "/login"

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.success("Password reset guidance has been prepared for this demo flow.")
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)
  }

  return (
    <div className="px-4 pb-6 sm:px-6">
      <PageShell
        eyebrow="Account recovery"
        title="Reset your password"
        description="Enter the email attached to your EkiSignal account and we will send recovery guidance for this production-style demo flow."
      >
        <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <section className="surface-panel rounded-[2rem] px-5 py-5 shadow-soft sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="forgot-email">Account email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className={cn(buttonVariants({ size: "lg" }), "w-full rounded-[1.2rem]")}
              >
                Send reset guidance
              </button>
            </form>
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "mt-4 rounded-[1.2rem] text-primary"
              )}
            >
              Back to sign in
            </Link>
          </section>

          <section className="surface-panel rounded-[2rem] px-5 py-5 shadow-soft sm:px-6">
            <p className="text-sm font-semibold text-foreground">Security note</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Account recovery protects personal report history, civic score, and badge review data. Public browsing remains open whether or not you are signed in.
            </p>
            <div className="mt-4 surface-muted rounded-[1.35rem] px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-[1.15rem] bg-primary/10 text-primary">
                  <ShieldCheck className="size-4.5" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Internal moderation and government handler credentials are managed separately inside the protected internal workspace.
                </p>
              </div>
            </div>
          </section>
        </div>
      </PageShell>
    </div>
  )
}
