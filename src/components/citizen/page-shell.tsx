import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  compact = false,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
  compact?: boolean
}) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-1 sm:gap-6 sm:px-6",
        compact ? "pt-3" : "pt-5 sm:pt-6"
      )}
    >
      <header className="surface-panel relative overflow-hidden rounded-[1.95rem] px-5 py-5 shadow-soft sm:px-6 sm:py-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,173,69,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(17,93,69,0.08),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="section-chip inline-flex items-center rounded-full px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary/75">
              {eyebrow}
            </div>
            <h1 className="mt-3 font-heading text-[1.75rem] font-semibold tracking-tight text-foreground sm:text-[2.1rem]">
              {title}
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[0.97rem]">
              {description}
            </p>
          </div>
          {actions ? <div className="relative shrink-0">{actions}</div> : null}
        </div>
        <div className="pointer-events-none absolute -right-10 top-4 size-24 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-8 size-20 rounded-full bg-primary/8 blur-3xl" />
      </header>
      {children}
    </section>
  )
}
