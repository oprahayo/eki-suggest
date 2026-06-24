"use client"

import { motion } from "framer-motion"
import { LoaderCircle, Search, ShieldCheck } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

interface TrackingSearchCardProps {
  query: string
  onQueryChange: (value: string) => void
  onSubmit: () => void
  isSearching: boolean
  recentCount: number
}

export function TrackingSearchCard({
  query,
  onQueryChange,
  onSubmit,
  isSearching,
  recentCount,
}: TrackingSearchCardProps) {
  return (
    <section className="surface-panel overflow-hidden rounded-[2rem] p-5 shadow-float sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary/72">
            Tracking lookup
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
            Check exact progress with your ticket number
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter the tracking number from your submission receipt to see the live public timeline,
            assigned office, and the latest accountability note.
          </p>
        </div>
        <div className="rounded-full bg-primary/[0.07] px-3 py-1.5 text-[0.72rem] font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          {recentCount > 0 ? `${recentCount} recent ticket${recentCount > 1 ? "s" : ""}` : "Ready"}
        </div>
      </div>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="flex-1">
          <InputGroup className="rounded-[1.45rem] bg-white/84">
            <InputGroupAddon>
              {isSearching ? (
                <LoaderCircle className="size-4 animate-spin text-primary" />
              ) : (
                <Search className="size-4 text-muted-foreground" />
              )}
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Enter tracking number, for example EKI-20260328-A1D3Q9"
              inputMode="search"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label="Search by tracking number"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>Secure public view</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.985, y: 1 }}
          className={cn(buttonVariants({ size: "lg" }), "min-w-36 rounded-[1.25rem]")}
          disabled={!query.trim() || isSearching}
        >
          {isSearching ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <ShieldCheck data-icon="inline-start" />
          )}
          Track report
        </motion.button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-foreground/[0.04] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
          Tip: copy the code exactly as shown after submission
        </span>
        <span className="rounded-full bg-foreground/[0.04] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
          Public notes are shown here, while internal moderation notes stay private
        </span>
      </div>
    </section>
  )
}
