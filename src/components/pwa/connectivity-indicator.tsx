"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CloudUpload, LoaderCircle, WifiOff } from "lucide-react"

import { usePwa } from "@/hooks/use-pwa"
import { useReportCenter } from "@/hooks/use-report-center"

export function ConnectivityIndicator() {
  const { isOnline } = usePwa()
  const {
    hydrated,
    isSyncingPendingSubmissions,
    pendingSubmissions,
  } = useReportCenter()

  if (!hydrated) {
    return null
  }

  const queuedCount = pendingSubmissions.length
  const shouldShow = !isOnline || isSyncingPendingSubmissions || queuedCount > 0

  if (!shouldShow) {
    return null
  }

  const copy = !isOnline
    ? queuedCount > 0
      ? `${queuedCount} saved report${queuedCount > 1 ? "s are" : " is"} queued for automatic send.`
      : "Drafts still save on this device while you are offline."
    : isSyncingPendingSubmissions
      ? "Sending saved reports as your connection returns."
      : `${queuedCount} saved report${queuedCount > 1 ? "s are" : " is"} waiting to sync.`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.96 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-[55] flex justify-center px-4"
      >
        <div className="glass-panel flex max-w-md items-center gap-3 rounded-full px-4 py-3 text-sm shadow-[0_28px_72px_-42px_rgba(8,28,20,0.82)]">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            {!isOnline ? (
              <WifiOff className="size-4.5" />
            ) : isSyncingPendingSubmissions ? (
              <LoaderCircle className="size-4.5 animate-spin" />
            ) : (
              <CloudUpload className="size-4.5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">
              {!isOnline ? "You are offline" : "Saved reports are syncing"}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">{copy}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
