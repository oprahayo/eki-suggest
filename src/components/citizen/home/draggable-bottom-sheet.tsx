"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface DraggableBottomSheetProps {
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  children: ReactNode
  className?: string
}

export function DraggableBottomSheet({
  expanded,
  onExpandedChange,
  children,
  className,
}: DraggableBottomSheetProps) {
  return (
    <motion.section
      initial={false}
      drag="y"
      dragElastic={0.12}
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 90) {
          onExpandedChange(false)
          return
        }

        if (info.offset.y < -60) {
          onExpandedChange(true)
        }
      }}
      className={cn(
        "absolute inset-x-0 z-30 mx-auto w-full max-w-md px-3 sm:max-w-lg",
        expanded
          ? "bottom-[calc(9.25rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(5.25rem+env(safe-area-inset-bottom))]",
        className
      )}
    >
      <div
        className={cn(
          "glass-panel overflow-hidden rounded-[2.2rem] border border-white/54 px-4 pt-3 pb-6 shadow-[0_54px_130px_-54px_rgba(5,16,12,0.72)] backdrop-blur-2xl",
          expanded
            ? "max-h-[min(28rem,calc(100vh-14rem))]"
            : "max-h-[10rem]"
        )}
      >
        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          className="mx-auto flex h-8 w-full items-center justify-center"
          aria-label={expanded ? "Collapse bottom sheet" : "Expand bottom sheet"}
        >
          <span className="flex h-1.5 w-14 rounded-full bg-foreground/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.34)]" />
          <span className="sr-only">{expanded ? "Collapse" : "Expand"}</span>
        </button>
        {children}
      </div>
    </motion.section>
  )
}
