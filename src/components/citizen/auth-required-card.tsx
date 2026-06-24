"use client"

import Link from "next/link"
import { LockKeyhole, MapPinned, ShieldCheck, Sparkles } from "lucide-react"
import { usePathname } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface AuthRequiredCardProps {
  title: string
  description: string
  compact?: boolean
}

export function AuthRequiredCard({
  title,
  description,
  compact = false,
}: AuthRequiredCardProps) {
  const pathname = usePathname()
  const { requestSignIn } = useAuth()

  return (
    <section
      className={cn(
        "surface-panel relative overflow-hidden rounded-[2rem] px-5 py-5 shadow-soft sm:px-6",
        compact && "rounded-[1.7rem] px-4 py-4"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,173,69,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(17,93,69,0.08),transparent_24%)]" />
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[1.35rem] bg-primary/10 text-primary">
            <LockKeyhole className="size-5" />
          </div>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
              Sign in required
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Protected submissions",
              detail: "New reports attach to your profile and civic score only after sign-in.",
              icon: ShieldCheck,
            },
            {
              label: "Public map stays open",
              detail: "You can still browse public signals, notices, and tracking updates without an account.",
              icon: MapPinned,
            },
            {
              label: "Stable return path",
              detail: "After sign-in, EkiSignal returns you to the page you were trying to open.",
              icon: Sparkles,
            },
          ].map((item) => {
            const Icon = item.icon

            return (
              <div key={item.label} className="surface-muted rounded-[1.35rem] px-4 py-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Icon className="size-4 text-primary" />
                  {item.label}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={requestSignIn(pathname)}
            className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
          >
            Sign in
          </Link>
          <Link
            href={`/signup?redirect=${encodeURIComponent(pathname)}`}
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
            Continue browsing public signals
          </Link>
        </div>
      </div>
    </section>
  )
}
