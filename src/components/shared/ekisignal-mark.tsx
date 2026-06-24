"use client"

import { cn } from "@/lib/utils"

export function EkiSignalMark({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative rounded-[1.2rem] bg-[linear-gradient(180deg,#115d45,#0d4c37)] shadow-[0_22px_44px_-24px_rgba(17,93,69,0.58)]",
          compact ? "size-10" : "size-12"
        )}
      >
        <span className="absolute inset-x-[28%] top-[24%] h-[17%] rounded-full bg-white/94" />
        <span className="absolute inset-x-[22%] top-[47%] h-[17%] rounded-full bg-white/94" />
        <span className="absolute right-[16%] top-[28%] size-[16%] rounded-full bg-[#d7ad45]" />
      </div>
      <div className="min-w-0">
        <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
          EkiSignal
        </p>
        <p className="text-xs font-medium text-muted-foreground">
          Civic reporting for Ekiti State
        </p>
      </div>
    </div>
  )
}
