"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Building2, X } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AdminAssignmentModalProps {
  open: boolean
  mode: "assign" | "reassign"
  currentOfficeId?: string
  reportTitle?: string
  offices: { id: string; name: string }[]
  onClose: () => void
  onConfirm: (input: {
    officeId: string
    note: string
    sharePublicly: boolean
  }) => void
}

export function AdminAssignmentModal({
  open,
  mode,
  currentOfficeId,
  reportTitle,
  offices,
  onClose,
  onConfirm,
}: AdminAssignmentModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <AssignmentModalPanel
          key={`${mode}-${currentOfficeId ?? "none"}-${reportTitle ?? "ticket"}`}
          mode={mode}
          currentOfficeId={currentOfficeId}
          reportTitle={reportTitle}
          offices={offices}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      ) : null}
    </AnimatePresence>
  )
}

function AssignmentModalPanel({
  mode,
  currentOfficeId,
  reportTitle,
  offices,
  onClose,
  onConfirm,
}: Omit<AdminAssignmentModalProps, "open">) {
  const [officeId, setOfficeId] = useState(currentOfficeId ?? offices[0]?.id ?? "")
  const [note, setNote] = useState("")
  const [sharePublicly, setSharePublicly] = useState(true)

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/25 px-4 py-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="w-full max-w-xl rounded-[1.9rem] border border-white/60 bg-white/94 shadow-[0_34px_110px_-52px_rgba(8,28,20,0.48)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/60 px-5 py-4">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
              {mode === "assign" ? "Assign ticket" : "Reassign ticket"}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              {mode === "assign"
                ? "Choose the first responsible office"
                : "Move this ticket to a new office"}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {reportTitle ?? "Selected report"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-full bg-foreground/[0.05] text-muted-foreground hover:text-foreground"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Office queue
            </p>
            <Select value={officeId} onValueChange={(value) => setOfficeId(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose office" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {offices.map((office) => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Assignment note
            </p>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Explain why this office should own the issue or why the queue is changing."
              className="min-h-28 rounded-[1.2rem] bg-white"
            />
          </div>

          <label className="flex items-start gap-3 rounded-[1.35rem] border border-white/60 bg-foreground/[0.03] px-4 py-4">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-border accent-[var(--primary)]"
              checked={sharePublicly}
              onChange={(event) => setSharePublicly(event.target.checked)}
            />
            <span className="text-sm leading-6 text-muted-foreground">
              Share a public-safe assignment note on the citizen timeline when appropriate.
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/60 px-5 py-4">
          <p className="text-xs leading-5 text-muted-foreground">
            Assignment changes are captured in the audit trail immediately.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-[1.2rem]")}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!officeId) {
                  return
                }

                onConfirm({ officeId, note, sharePublicly })
              }}
              disabled={!officeId}
              className={cn(buttonVariants({ size: "lg" }), "rounded-[1.2rem]")}
            >
              <Building2 data-icon="inline-start" />
              {mode === "assign" ? "Assign office" : "Confirm reassignment"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
