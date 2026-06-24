"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "interactive-press group/toggle inline-flex items-center justify-center gap-1 rounded-[calc(var(--radius)*0.95)] text-sm font-semibold whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[4px] focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/16 aria-pressed:bg-primary/[0.08] aria-pressed:text-primary data-[state=on]:bg-primary/[0.08] data-[state=on]:text-primary dark:aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] hover:bg-white/92 data-[state=on]:border-primary/16 data-[state=on]:bg-primary/[0.08]",
      },
      size: {
        default: "h-10 min-w-10 px-3",
        sm: "h-8 min-w-8 rounded-[calc(var(--radius)-2px)] px-2 text-[0.8rem]",
        lg: "h-11 min-w-11 px-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
