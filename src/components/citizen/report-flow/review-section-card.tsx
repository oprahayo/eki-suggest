"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Pencil } from "lucide-react"

import { cn } from "@/lib/utils"

interface ReviewSectionCardProps {
  title: string
  helper?: string
  value: ReactNode
  onEdit: () => void
  className?: string
}

export function ReviewSectionCard({
  title,
  helper,
  value,
  onEdit,
  className,
}: ReviewSectionCardProps) {
  return (
    <div
      className={cn(
        "surface-panel rounded-[1.55rem] p-4 shadow-soft",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </p>
          {helper ? (
            <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
          ) : null}
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97, y: 1 }}
          onClick={onEdit}
          className="interactive-press inline-flex items-center gap-1 rounded-full bg-primary/8 px-3 py-1.5 text-[0.72rem] font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.48)]"
        >
          <Pencil className="size-3.5" />
          Edit
        </motion.button>
      </div>

      <div className="mt-3 text-sm leading-6 text-foreground">{value}</div>
    </div>
  )
}
