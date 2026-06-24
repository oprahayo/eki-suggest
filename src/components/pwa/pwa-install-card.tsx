"use client"

import { motion } from "framer-motion"
import { Download, ShieldCheck, Sparkles, WifiOff, X } from "lucide-react"
import { toast } from "sonner"

import { buttonVariants } from "@/components/ui/button"
import { usePwa } from "@/hooks/use-pwa"
import { cn } from "@/lib/utils"

export function PwaInstallCard({ compact = false }: { compact?: boolean }) {
  const { canInstall, dismissInstallHint, isStandalone, promptInstall, showInstallHint } =
    usePwa()

  if (isStandalone) {
    return null
  }

  if (!showInstallHint && canInstall) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[1.7rem] border border-primary/14 bg-[linear-gradient(135deg,rgba(15,92,67,0.12),rgba(255,255,255,0.96)_58%)] p-4 shadow-[0_26px_64px_-40px_rgba(8,28,20,0.48)] backdrop-blur-xl",
        compact && "rounded-[1.5rem] p-3.5"
      )}
    >
      <div className="absolute inset-y-0 right-0 w-28 bg-[radial-gradient(circle_at_center,rgba(217,173,69,0.2),transparent_68%)]" />
      {showInstallHint ? (
        <button
          type="button"
          onClick={dismissInstallHint}
          className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-white/75 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Dismiss install prompt"
        >
          <X className="size-4" />
        </button>
      ) : null}

      <div className="relative flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-primary text-primary-foreground shadow-[0_20px_44px_-26px_rgba(15,92,67,0.76)]">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0 pr-8">
          <p className="text-sm font-semibold text-foreground">Install EkiSignal</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {showInstallHint
              ? "Pin the platform to your phone for faster launch, lighter repeat loads, offline draft safety, and app-like civic reporting."
              : "Use your browser share or overflow menu and choose Add to Home Screen or Install app so EkiSignal opens like a proper civic app on your device."}
          </p>
        </div>
      </div>

      {!compact ? (
        <div className="relative mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-[1.15rem] border border-white/70 bg-white/74 px-3 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Faster repeat access
            </div>
            <p className="mt-1 text-xs leading-5">Open straight into the civic app shell from your home screen.</p>
          </div>
          <div className="rounded-[1.15rem] border border-white/70 bg-white/74 px-3 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <WifiOff className="size-4 text-primary" />
              Safer on weak signal
            </div>
            <p className="mt-1 text-xs leading-5">Drafts stay safer when connectivity drops during a report.</p>
          </div>
          <div className="rounded-[1.15rem] border border-white/70 bg-white/74 px-3 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              Cleaner mobile launch
            </div>
            <p className="mt-1 text-xs leading-5">Standalone mode feels closer to a proper civic app on both iPhone and Android.</p>
          </div>
        </div>
      ) : null}

      <div className="relative mt-4 flex flex-wrap gap-2.5">
        {showInstallHint ? (
          <>
            <button
              type="button"
              onClick={async () => {
                const result = await promptInstall()

                if (result === "accepted") {
                  toast.success("EkiSignal has been added to your device.")
                  return
                }

                if (result === "dismissed") {
                  toast.message("You can still install later from your browser menu.")
                  return
                }

                toast.message("Use your browser menu and choose Add to Home Screen.")
              }}
              className={cn(buttonVariants({ size: compact ? "default" : "lg" }), "rounded-[1.15rem]")}
            >
              <Download data-icon="inline-start" />
              Install app
            </button>
            <button
              type="button"
              onClick={dismissInstallHint}
              className={cn(
                buttonVariants({ variant: "outline", size: compact ? "default" : "lg" }),
                "rounded-[1.15rem] border-white/70 bg-white/75"
              )}
            >
              Maybe later
            </button>
          </>
        ) : (
          <div className="rounded-[1.15rem] border border-white/70 bg-white/76 px-4 py-3 text-sm leading-6 text-muted-foreground">
            Use your browser share or overflow menu and choose{" "}
            <span className="font-semibold text-foreground">Add to Home Screen</span> or{" "}
            <span className="font-semibold text-foreground">Install app</span>.
          </div>
        )}
      </div>
    </motion.div>
  )
}
