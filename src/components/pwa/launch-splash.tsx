"use client"

import { AnimatePresence, motion } from "framer-motion"
import { MapPinned, ShieldCheck } from "lucide-react"

export function LaunchSplash({ open }: { open: boolean }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed inset-0 z-[90] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(217,173,69,0.2),transparent_34%),linear-gradient(180deg,#f7f7f0,#eef5ef)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(15,92,67,0.16),transparent_26%)]" />
          <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
            <motion.span
              className="absolute size-52 rounded-full border border-primary/14"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [0.82, 1.12, 1.2], opacity: [0, 0.44, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              className="absolute size-36 rounded-full border border-accent/40"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [0.82, 1.08, 1.18], opacity: [0, 0.34, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, delay: 0.18, ease: "easeOut" }}
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex size-[5.25rem] items-center justify-center rounded-[1.9rem] bg-primary text-primary-foreground shadow-[0_32px_74px_-36px_rgba(15,92,67,0.9)]"
            >
              <div className="absolute inset-2 rounded-[1.3rem] border border-white/14" />
              <MapPinned className="size-8" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 mt-6"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
                Ekiti civic reporting
              </p>
              <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground">
                EkiSignal
              </h1>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                Opening your map, saved drafts, and community reporting tools.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 mt-8 inline-flex items-center gap-2 rounded-full bg-white/74 px-4 py-2 text-xs font-medium text-muted-foreground shadow-[0_18px_42px_-30px_rgba(8,28,20,0.42)] backdrop-blur-xl"
            >
              <ShieldCheck className="size-4 text-primary" />
              Trusted reporting, even on weak signal
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
