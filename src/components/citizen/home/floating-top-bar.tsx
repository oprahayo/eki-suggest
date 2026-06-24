"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Bell, MapPin, Menu, UserRound } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface FloatingTopBarProps {
  areaLabel: string
  onOpenMenu: () => void
  onRequestLocation?: () => void
}

function IconChrome({
  children,
  className,
  ...props
}: React.ComponentProps<typeof motion.button>) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95, y: 1 }}
      className={cn(
        "glass-panel interactive-press inline-flex size-11 items-center justify-center rounded-[1.35rem] text-foreground shadow-float sm:size-12 sm:rounded-[1.5rem]",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <motion.div whileTap={{ scale: 0.95, y: 1 }}>
      <Link
        href={href}
        aria-label={label}
        className="glass-panel interactive-press inline-flex size-11 items-center justify-center rounded-[1.35rem] text-foreground shadow-float sm:size-12 sm:rounded-[1.5rem]"
      >
        {children}
      </Link>
    </motion.div>
  )
}

export function FloatingTopBar({
  areaLabel,
  onOpenMenu,
  onRequestLocation,
}: FloatingTopBarProps) {
  const { isAuthenticated, requestSignIn } = useAuth()
  const accountHref = isAuthenticated ? "/account" : requestSignIn("/account")

  return (
    <header className="pointer-events-auto relative z-[1100] flex items-center gap-2 px-3.5 pt-[calc(0.95rem+env(safe-area-inset-top))] sm:gap-3 sm:px-6">
      <IconChrome
        aria-label="Open menu"
        onClick={onOpenMenu}
      >
        <Menu className="size-5" />
      </IconChrome>

      <div className="glass-panel flex min-w-0 flex-1 items-center gap-3 rounded-[1.55rem] px-3 py-2.5 shadow-float sm:rounded-[1.7rem] sm:px-3.5">
        <motion.button
          type="button"
          aria-label="Use current location"
          whileTap={{ scale: 0.95, y: 1 }}
          onClick={onRequestLocation}
          className="icon-brand interactive-press inline-flex size-11 shrink-0 items-center justify-center rounded-[1.2rem] border border-white/58 sm:size-12 sm:rounded-[1.35rem]"
        >
          <MapPin className="size-5" />
        </motion.button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold text-foreground sm:text-[1.02rem]">
            {areaLabel}
          </p>
          <p className="truncate text-[0.72rem] text-muted-foreground sm:text-[0.78rem]">
            Report and track issues near you
          </p>
        </div>
      </div>

      {isAuthenticated ? (
        <IconLink href="/alerts" label="Open alerts">
          <Bell className="size-5" />
        </IconLink>
      ) : null}

      <IconLink href={accountHref} label={isAuthenticated ? "Open account" : "Sign in"}>
        <UserRound className="size-5" />
      </IconLink>
    </header>
  )
}
