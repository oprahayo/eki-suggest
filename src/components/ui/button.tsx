"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "interactive-press group/button inline-flex shrink-0 items-center justify-center rounded-[calc(var(--radius)*1.02)] border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap outline-none select-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/18 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(180deg,rgba(17,93,69,1),rgba(12,72,53,1))] text-primary-foreground shadow-[0_22px_48px_-28px_rgba(17,93,69,0.86)] hover:brightness-[1.03]",
        outline:
          "border-white/72 bg-white/76 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.58)] hover:border-white hover:bg-white/92 aria-expanded:bg-white aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "border border-[rgba(217,173,69,0.24)] bg-[linear-gradient(180deg,rgba(255,252,244,1),rgba(255,246,224,0.96))] text-accent-foreground shadow-[0_18px_42px_-32px_rgba(95,66,8,0.2)] hover:brightness-[1.01] aria-expanded:bg-[linear-gradient(180deg,rgba(255,252,244,1),rgba(255,246,224,0.96))] aria-expanded:text-accent-foreground",
        ghost:
          "text-muted-foreground hover:bg-primary/[0.07] hover:text-primary aria-expanded:bg-primary/[0.08] aria-expanded:text-primary dark:hover:bg-muted/50",
        destructive:
          "bg-[linear-gradient(180deg,rgba(196,71,61,0.98),rgba(168,55,47,1))] text-white shadow-[0_22px_44px_-30px_rgba(196,71,61,0.6)] hover:brightness-[1.03] focus-visible:border-destructive/40 focus-visible:ring-destructive/18 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-[calc(var(--radius)-4px)] px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[calc(var(--radius)-2px)] px-3 text-[0.82rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-4.5 text-[0.95rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-[calc(var(--radius)-4px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[calc(var(--radius)-1px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
