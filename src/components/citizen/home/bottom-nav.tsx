"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, House, NotebookText, UserRound } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

const navigation = [
  {
    href: "/",
    label: "Home",
    icon: House,
    match: (pathname: string) => pathname === "/",
  },
  {
    href: "/reports",
    label: "Reports",
    icon: NotebookText,
    match: (pathname: string) =>
      pathname.startsWith("/reports") ||
      pathname.startsWith("/my-reports") ||
      pathname.startsWith("/track") ||
      pathname.startsWith("/report"),
  },
  {
    href: "/alerts",
    label: "Alerts",
    icon: Bell,
    match: (pathname: string) => pathname.startsWith("/alerts"),
  },
  {
    href: "/account",
    label: "Account",
    icon: UserRound,
    match: (pathname: string) =>
      pathname.startsWith("/account") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/help") ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/how-it-works") ||
      pathname.startsWith("/donate") ||
      pathname.startsWith("/transparency") ||
      pathname.startsWith("/rewards"),
  },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated, requestSignIn } = useAuth()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1100] mx-auto w-full max-w-[36rem] px-3 pb-[calc(0.8rem+env(safe-area-inset-bottom))] sm:px-4">
      <div className="glass-panel mx-auto flex max-w-[34rem] items-center justify-between rounded-[2rem] border border-white/58 px-2 py-2 shadow-[0_36px_90px_-48px_rgba(8,25,18,0.52)] backdrop-blur-2xl">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = item.match(pathname)
          const href =
            item.label === "Account" && !isAuthenticated
              ? requestSignIn("/account")
              : item.href

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "interactive-press relative flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-[1.55rem] px-2 py-2.5 text-[0.72rem] font-semibold",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="ekisignal-active-nav"
                  className="absolute inset-0 rounded-[1.55rem] bg-[linear-gradient(180deg,rgba(17,93,69,0.14),rgba(17,93,69,0.08))]"
                  transition={{ type: "spring", bounce: 0.24, duration: 0.5 }}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-[1rem] transition-colors",
                  isActive
                    ? "bg-white/82 text-primary shadow-[0_14px_32px_-24px_rgba(17,93,69,0.46)]"
                    : "bg-transparent"
                )}
              >
                <Icon className="size-4.5" />
              </span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
