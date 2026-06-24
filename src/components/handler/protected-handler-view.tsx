"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, ShieldCheck } from "lucide-react"

import type { AdminSession } from "@/components/admin/admin-utils"
import { HandlerDashboard } from "@/components/handler/handler-dashboard"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const ADMIN_SESSION_KEY = "ekisignal.admin.session.v1"

function safeParseSession(value: string | null) {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as AdminSession
  } catch {
    return null
  }
}

export function ProtectedHandlerView() {
  const [session, setSession] = useState<AdminSession | null | undefined>(undefined)

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setSession(safeParseSession(window.sessionStorage.getItem(ADMIN_SESSION_KEY)))
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  if (typeof session === "undefined") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,92,67,0.12),transparent_26%),linear-gradient(180deg,#f7f7f1,#eef3ee)] px-4 py-6 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
          <Skeleton className="h-[18rem] rounded-[2rem]" />
          <Skeleton className="h-[18rem] rounded-[2rem]" />
        </div>
      </div>
    )
  }

  if (!session || !["government_handler", "super_admin"].includes(session.role)) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,92,67,0.12),transparent_26%),linear-gradient(180deg,#f7f7f1,#eef3ee)] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="surface-panel rounded-[2rem] px-6 py-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-[1.3rem] bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
                  Protected handler access
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  Government handler access is role-based
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The handler workspace is only available after signing into the internal EkiSignal workspace with a government handler or super admin session.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/admin"
                    className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
                  >
                    Open internal workspace
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                  <Link
                    href="/"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "rounded-[1.2rem] border-white/70 bg-white/78"
                    )}
                  >
                    Back to citizen app
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <HandlerDashboard />
}
