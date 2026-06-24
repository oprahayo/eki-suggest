"use client"

import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

import type { ReportMedia } from "@/lib/types"

interface AdminMediaLightboxProps {
  media: ReportMedia | null
  onClose: () => void
}

export function AdminMediaLightbox({ media, onClose }: AdminMediaLightboxProps) {
  return (
    <AnimatePresence>
      {media ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(7,16,12,0.72)] px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/16"
            aria-label="Close media viewer"
          >
            <X className="size-5" />
          </button>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1511] shadow-[0_42px_120px_-48px_rgba(0,0,0,0.72)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 text-white">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{media.name}</p>
                <p className="mt-1 text-xs text-white/60">
                  {media.kind.toUpperCase()} • {media.sizeLabel}
                </p>
              </div>
            </div>

            <div className="relative flex min-h-[60vh] items-center justify-center bg-[#09110d] p-4 sm:p-6">
              {media.kind === "image" && media.previewUrl ? (
                <div className="relative h-[65vh] w-full">
                  <Image
                    src={media.previewUrl}
                    alt={media.name}
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
              ) : media.kind === "video" && media.previewUrl ? (
                <video
                  src={media.previewUrl}
                  controls
                  playsInline
                  className="max-h-[65vh] w-full rounded-[1.5rem] bg-black object-contain"
                />
              ) : (
                <div className="rounded-[1.4rem] border border-white/10 bg-white/4 px-5 py-5 text-sm text-white/70">
                  Preview unavailable for this media type.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
