"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ChipTone = "green" | "gold" | "neutral" | "red"

const toneClasses: Record<ChipTone, string> = {
  green:
    "bg-[linear-gradient(180deg,rgba(10,61,45,0.98),rgba(17,93,69,0.94))] text-white",
  gold:
    "bg-[linear-gradient(180deg,rgba(217,173,69,0.24),rgba(255,255,255,0.94))] text-accent-foreground",
  neutral:
    "bg-[linear-gradient(180deg,rgba(16,36,26,0.06),rgba(255,255,255,0.94))] text-foreground",
  red:
    "bg-[linear-gradient(180deg,rgba(244,83,75,0.16),rgba(255,255,255,0.94))] text-red-700",
}

const iconToneClasses: Record<ChipTone, string> = {
  green: "bg-white/12 text-white",
  gold: "bg-white/70 text-accent-foreground",
  neutral: "bg-white/78 text-foreground",
  red: "bg-white/76 text-red-600",
}

interface QuickCategoryChipProps {
  href: string
  label: string
  helper: string
  icon: LucideIcon
  tone?: ChipTone
}

export function QuickCategoryChip({
  href,
  label,
  helper,
  icon: Icon,
  tone = "green",
}: QuickCategoryChipProps) {
  return (
    <motion.div whileTap={{ scale: 0.98, y: 1 }} whileHover={{ y: -2 }}>
      <Link
        href={href}
        className={cn(
          "interactive-press inline-flex min-w-[11rem] items-center gap-3 rounded-[1.55rem] border border-white/58 px-3.5 py-3.5 shadow-[0_22px_44px_-30px_rgba(9,31,22,0.38)]",
          toneClasses[tone]
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[1rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]",
            iconToneClasses[tone]
          )}
        >
          <Icon className="size-4.5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{label}</span>
          <span className="block truncate text-[0.72rem] opacity-78">{helper}</span>
        </span>
      </Link>
    </motion.div>
  )
}
