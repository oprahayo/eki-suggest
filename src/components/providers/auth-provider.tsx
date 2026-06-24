"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

export type AppRole =
  | "citizen"
  | "super_admin"
  | "moderator"
  | "government_handler"
  | "viewer_analyst"

export interface AuthSession {
  id: string
  role: AppRole
  fullName: string
  email: string
  phone?: string
  defaultLocation: string
  memberSince: string
  officeId?: string
}

interface SignInInput {
  email: string
  password: string
  role?: AppRole
  fullName?: string
  phone?: string
  officeId?: string
}

interface SignUpInput {
  fullName: string
  email: string
  phone: string
  password: string
}

interface UpdateProfileInput {
  fullName?: string
  phone?: string
  defaultLocation?: string
}

interface AuthContextValue {
  hydrated: boolean
  session: AuthSession | null
  isAuthenticated: boolean
  isCitizen: boolean
  signIn: (input: SignInInput) => Promise<AuthSession>
  signUp: (input: SignUpInput) => Promise<AuthSession>
  updateProfile: (input: UpdateProfileInput) => void
  logout: () => void
  requestSignIn: (path?: string) => string
  getReturnPath: (fallback?: string) => string
  clearReturnPath: () => void
}

const AUTH_SESSION_KEY = "ekisignal.auth.session.v1"
const AUTH_RETURN_TO_KEY = "ekisignal.auth.return-to.v1"

const AuthContext = createContext<AuthContextValue | null>(null)

function createDisplayName(email: string) {
  const localPart = email.split("@")[0] ?? "citizen"

  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

function inferRole(email: string) {
  const normalized = email.toLowerCase()

  if (normalized.includes("superadmin") || normalized.includes("admin")) {
    return "super_admin" as const
  }

  if (normalized.includes("moderator")) {
    return "moderator" as const
  }

  if (normalized.includes("handler") || normalized.includes("office")) {
    return "government_handler" as const
  }

  if (normalized.includes("analyst") || normalized.includes("viewer")) {
    return "viewer_analyst" as const
  }

  return "citizen" as const
}

function createSession(input: {
  fullName?: string
  email: string
  phone?: string
  role: AppRole
  officeId?: string
  memberSince?: string
  defaultLocation?: string
}): AuthSession {
  return {
    id: `auth-${input.email.toLowerCase()}`,
    role: input.role,
    fullName: input.fullName?.trim() || createDisplayName(input.email),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim(),
    defaultLocation: input.defaultLocation ?? "Ado-Ekiti, Nigeria",
    memberSince: input.memberSince ?? new Date().toISOString(),
    officeId: input.officeId,
  }
}

function safeParseSession(value: string | null) {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as AuthSession
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const storedSession = safeParseSession(window.localStorage.getItem(AUTH_SESSION_KEY))

      if (storedSession) {
        setSession(storedSession)
      }

      setHydrated(true)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    if (session) {
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
      return
    }

    window.localStorage.removeItem(AUTH_SESSION_KEY)
  }, [hydrated, session])

  const value = useMemo<AuthContextValue>(
    () => ({
      hydrated,
      session,
      isAuthenticated: Boolean(session),
      isCitizen: session?.role === "citizen",
      signIn: async (input) => {
        const nextSession = createSession({
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          role: input.role ?? inferRole(input.email),
          officeId: input.officeId,
          memberSince: session?.memberSince,
          defaultLocation: session?.defaultLocation ?? "Ado-Ekiti, Nigeria",
        })

        setSession(nextSession)
        return nextSession
      },
      signUp: async (input) => {
        const nextSession = createSession({
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          role: "citizen",
        })

        setSession(nextSession)
        return nextSession
      },
      updateProfile: (input) => {
        setSession((currentSession) =>
          currentSession
            ? {
                ...currentSession,
                fullName: input.fullName?.trim() || currentSession.fullName,
                phone: input.phone?.trim() || currentSession.phone,
                defaultLocation:
                  input.defaultLocation?.trim() || currentSession.defaultLocation,
              }
            : currentSession
        )
      },
      logout: () => {
        setSession(null)
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(AUTH_RETURN_TO_KEY)
        }
      },
      requestSignIn: (path = "/account") => {
        return `/login?redirect=${encodeURIComponent(path)}`
      },
      getReturnPath: (fallback = "/account") => {
        if (typeof window === "undefined") {
          return fallback
        }

        return window.sessionStorage.getItem(AUTH_RETURN_TO_KEY) ?? fallback
      },
      clearReturnPath: () => {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(AUTH_RETURN_TO_KEY)
        }
      },
    }),
    [hydrated, session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
