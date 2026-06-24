"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type InstallPromptResult = "accepted" | "dismissed" | "unavailable"

interface PwaContextValue {
  canInstall: boolean
  isOnline: boolean
  isStandalone: boolean
  showInstallHint: boolean
  showLaunchSplash: boolean
  dismissInstallHint: () => void
  promptInstall: () => Promise<InstallPromptResult>
}

const INSTALL_HINT_DISMISSED_KEY = "ekisignal.v1.install-hint-dismissed"
const LAUNCH_SPLASH_SEEN_KEY = "ekisignal.v1.launch-splash-seen"
const PwaContext = createContext<PwaContextValue | null>(null)

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [installHintDismissed, setInstallHintDismissed] = useState(false)
  const [showLaunchSplash, setShowLaunchSplash] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    let splashTimeout: number | null = null
    const hostname = window.location.hostname
    const isLocalPreview =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.endsWith(".local")
    const syncStandaloneState = () => {
      const standaloneNavigator = window.navigator as Navigator & {
        standalone?: boolean
      }
      const standalone =
        mediaQuery.matches || standaloneNavigator.standalone === true

      setIsStandalone(standalone)

      if (standalone) {
        const hasSeenSplash = window.sessionStorage.getItem(LAUNCH_SPLASH_SEEN_KEY) === "1"

        if (!hasSeenSplash) {
          setShowLaunchSplash(true)
          window.sessionStorage.setItem(LAUNCH_SPLASH_SEEN_KEY, "1")

          if (splashTimeout) {
            window.clearTimeout(splashTimeout)
          }

          splashTimeout = window.setTimeout(() => {
            setShowLaunchSplash(false)
          }, 950)
          return
        }
      }

      setShowLaunchSplash(false)
    }

    const syncBrowserState = () => {
      syncStandaloneState()
      setIsOnline(window.navigator.onLine)
      setInstallHintDismissed(
        window.localStorage.getItem(INSTALL_HINT_DISMISSED_KEY) === "1"
      )

    }

    if ("serviceWorker" in navigator) {
      if (isLocalPreview) {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) =>
            Promise.all(registrations.map((registration) => registration.unregister()))
          )
          .catch(() => null)

        if ("caches" in window) {
          caches
            .keys()
            .then((keys) =>
              Promise.all(
                keys
                  .filter((key) => key.startsWith("ekisignal-"))
                  .map((key) => caches.delete(key))
              )
            )
            .catch(() => null)
        }
      } else {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch(() => null)
      }
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const handleInstalled = () => {
      setInstallPrompt(null)
      setInstallHintDismissed(false)
      window.localStorage.removeItem(INSTALL_HINT_DISMISSED_KEY)
      syncStandaloneState()
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const syncFrameId = window.requestAnimationFrame(syncBrowserState)
    mediaQuery.addEventListener("change", syncStandaloneState)
    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleInstalled)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      mediaQuery.removeEventListener("change", syncStandaloneState)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleInstalled)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.cancelAnimationFrame(syncFrameId)
      if (splashTimeout) {
        window.clearTimeout(splashTimeout)
      }
    }
  }, [])

  const value = useMemo<PwaContextValue>(
    () => ({
      canInstall: Boolean(installPrompt) && !isStandalone,
      isOnline,
      isStandalone,
      showInstallHint:
        Boolean(installPrompt) && !isStandalone && !installHintDismissed,
      showLaunchSplash,
      dismissInstallHint: () => {
        setInstallHintDismissed(true)
        window.localStorage.setItem(INSTALL_HINT_DISMISSED_KEY, "1")
      },
      promptInstall: async () => {
        if (!installPrompt) {
          return "unavailable"
        }

        await installPrompt.prompt()
        const choice = await installPrompt.userChoice
        setInstallPrompt(null)

        if (choice.outcome === "accepted") {
          setInstallHintDismissed(false)
          window.localStorage.removeItem(INSTALL_HINT_DISMISSED_KEY)
        }

        return choice.outcome
      },
    }),
    [installHintDismissed, installPrompt, isOnline, isStandalone, showLaunchSplash]
  )

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>
}

export function usePwa() {
  const context = useContext(PwaContext)

  if (!context) {
    throw new Error("usePwa must be used inside PwaProvider")
  }

  return context
}
