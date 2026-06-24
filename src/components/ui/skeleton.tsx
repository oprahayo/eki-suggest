import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-[linear-gradient(90deg,rgba(229,237,229,0.86),rgba(245,248,242,0.96),rgba(229,237,229,0.86))] before:absolute before:inset-0 before:-translate-x-full before:content-[''] before:animate-[shimmer_1.8s_infinite] before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
