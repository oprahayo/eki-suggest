"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AlertCircle, CircleCheckBig, Info } from "lucide-react"

import { formatLagosTimestamp } from "@/lib/dates"
import { cn } from "@/lib/utils"
import type { PublicNotice } from "@/lib/types"

const toneIcon = {
  default: Info,
  warning: AlertCircle,
  success: CircleCheckBig,
} as const

const toneClasses = {
  default: "bg-primary/8 text-primary",
  warning: "bg-red-50 text-red-600",
  success: "bg-primary/10 text-primary",
} as const

export function AreaNoticeCard({ notice }: { notice: PublicNotice }) {
  const Icon = toneIcon[notice.tone]

  return (
    <motion.div whileTap={{ scale: 0.988, y: 1 }}>
      <Link
        href="/alerts"
        className="surface-panel interactive-press block rounded-[1.55rem] px-4 py-4"
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[1rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
              toneClasses[notice.tone]
            )}
          >
            <Icon className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{notice.title}</p>
              <span className="shrink-0 text-[0.68rem] font-medium text-muted-foreground">
                {formatLagosTimestamp(notice.createdAt)}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{notice.body}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {notice.area}
              </span>
              {notice.category ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                  {notice.category}
                </span>
              ) : null}
              {notice.impactLabel ? (
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  {notice.impactLabel}
                </span>
              ) : null}
            </div>
            {notice.office ? (
              <p className="mt-3 text-xs text-muted-foreground">{notice.office}</p>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
