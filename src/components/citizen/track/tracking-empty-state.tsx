import Link from "next/link"
import { SearchX, ShieldCheck } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function TrackingEmptyState({
  hasQuery,
  query,
}: {
  hasQuery: boolean
  query: string
}) {
  return (
    <section className="surface-panel rounded-[2rem] p-6 shadow-float">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-[1.6rem] bg-primary/[0.08] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.48)]">
          {hasQuery ? <SearchX className="size-7" /> : <ShieldCheck className="size-7" />}
        </div>
        <h3 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-foreground">
          {hasQuery ? "No public ticket matched that number yet" : "Enter a tracking number to begin"}
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {hasQuery
            ? `We could not find a public report for "${query}". Check the characters carefully or wait a little if the ticket was created very recently.`
            : "The tracking page shows clear timestamps, public status notes, and visible assignment details once a report is in the system."}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/report/new"
            className={cn(buttonVariants({ size: "lg" }), "rounded-[1.25rem]")}
          >
            Submit a report
          </Link>
          <Link
            href="/help"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-[1.25rem]")}
          >
            Help and FAQ
          </Link>
        </div>
      </div>
    </section>
  )
}
