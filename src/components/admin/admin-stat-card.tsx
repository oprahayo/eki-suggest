import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface AdminStatCardProps {
  label: string
  value: string
  helper: string
  icon: LucideIcon
}

export function AdminStatCard({ label, value, helper, icon: Icon }: AdminStatCardProps) {
  return (
    <Card className="rounded-[1.7rem] border-white/60 bg-white/86 shadow-[0_24px_70px_-48px_rgba(9,31,22,0.22)]">
      <CardContent className="flex items-start justify-between gap-4 pt-4">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[1.15rem] bg-[linear-gradient(180deg,rgba(17,93,69,0.14),rgba(255,255,255,0.92))] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.52)]">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}
