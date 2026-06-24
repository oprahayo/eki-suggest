"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { ImagePlus, LoaderCircle, Trash2, UploadCloud, Video } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { ReportMedia } from "@/lib/types"

interface MediaUploadFieldProps {
  mediaItems: ReportMedia[]
  isPreparing: boolean
  progress: number
  completedCount: number
  totalCount: number
  onFilesSelected: (files: FileList | null) => Promise<void>
  onRemove: (id: string) => void
}

export function MediaUploadField({
  mediaItems,
  isPreparing,
  progress,
  completedCount,
  totalCount,
  onFilesSelected,
  onRemove,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setDragActive(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragActive(false)
          void onFilesSelected(event.dataTransfer.files)
        }}
        className={cn(
          "rounded-[1.7rem] border border-dashed px-4 py-5 transition-colors",
          dragActive
            ? "border-primary/40 bg-primary/[0.07]"
            : "border-primary/18 bg-primary/[0.04]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="sr-only"
          onChange={async (event) => {
            await onFilesSelected(event.target.files)
            event.target.value = ""
          }}
        />

        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-[1.4rem] bg-white text-primary shadow-[0_18px_38px_-26px_rgba(9,31,22,0.46)]">
            <UploadCloud className="size-6" />
          </div>
          <p className="mt-4 text-base font-semibold text-foreground">
            Add photos or video evidence
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Tap to upload on mobile, or drag files here on desktop. Clear previews appear before final submission.
          </p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => inputRef.current?.click()}
            className={cn(buttonVariants({ size: "lg" }), "mt-4 rounded-[1.2rem]")}
          >
            <ImagePlus data-icon="inline-start" />
            Choose media
          </motion.button>
        </div>
      </div>

      {isPreparing ? (
        <div className="rounded-[1.5rem] border border-white/60 bg-white/82 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LoaderCircle className="size-4.5 animate-spin" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Preparing uploads
              </p>
              <p className="text-xs text-muted-foreground">
                {completedCount} of {totalCount} file(s) processed
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress}>
              <ProgressLabel>Upload preparation</ProgressLabel>
              <ProgressValue>
                {(formattedValue) => formattedValue ?? `${progress}%`}
              </ProgressValue>
            </Progress>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: Math.max(totalCount, 2) }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.35rem] border border-white/60 bg-white/72"
              >
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="space-y-2 px-4 py-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {mediaItems.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[1.45rem] border border-white/60 bg-white/82 shadow-[0_18px_42px_-30px_rgba(9,31,22,0.42)]"
            >
              {item.kind === "image" && item.previewUrl ? (
                <div className="relative h-44 w-full">
                  <Image
                    src={item.previewUrl}
                    alt={item.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : item.kind === "video" && item.previewUrl ? (
                <video
                  src={item.previewUrl}
                  controls
                  playsInline
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-foreground/[0.04]">
                  <Video className="size-12 text-primary" />
                </div>
              )}

              <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.kind.toUpperCase()} • {item.sizeLabel}
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onRemove(item.id)}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground/[0.05] text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="size-4" />
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
