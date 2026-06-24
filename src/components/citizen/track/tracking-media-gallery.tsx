import Image from "next/image"
import { FileImage, Video } from "lucide-react"

import type { ReportMedia } from "@/lib/types"

export function TrackingMediaGallery({ media }: { media: ReportMedia[] }) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/86 p-5 shadow-[0_30px_90px_-52px_rgba(12,30,22,0.38)] backdrop-blur sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[1.15rem] bg-primary/10 text-primary">
          <FileImage className="size-5" />
        </div>
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
            Submitted evidence
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Media thumbnails attached to this ticket
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Evidence stays tied to the report so handlers and citizens can reference the same proof.
          </p>
        </div>
      </div>

      {media.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {media.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[1.45rem] border border-white/60 bg-white/86 shadow-[0_18px_42px_-32px_rgba(9,31,22,0.32)]"
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

              <div className="px-4 py-3.5">
                <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.kind.toUpperCase()} • {item.sizeLabel}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.55rem] border border-dashed border-primary/16 bg-primary/[0.04] px-4 py-5 text-sm leading-6 text-muted-foreground">
          No media was attached to this ticket. The report can still be tracked normally with public
          notes and status updates.
        </div>
      )}
    </section>
  )
}
