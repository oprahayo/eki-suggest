"use client"

import {
  startTransition,
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"

import { useAuth } from "@/hooks/use-auth"
import { usePwa } from "@/hooks/use-pwa"
import { demoNotifications, demoReports, publicNotices } from "@/lib/demo-data"
import { getEstimatedResponse, resolveRoutingDecision } from "@/lib/routing"
import type {
  AppNotification,
  PendingSubmission,
  ReportRecord,
  ReportCoordinates,
  ReportSubmissionInput,
  SavedLocationPreference,
  SavedDraft,
  SubmitReportResult,
} from "@/lib/types"

const LOCAL_REPORTS_KEY = "ekisignal.v1.reports"
const LOCAL_DRAFT_KEY = "ekisignal.v1.draft"
const LOCAL_NOTIFICATIONS_KEY = "ekisignal.v1.notifications"
const LOCAL_TRACKED_KEY = "ekisignal.v1.recent-tracked"
const LOCAL_PENDING_KEY = "ekisignal.v1.pending-submissions"
const LOCAL_LOCATION_KEY = "ekisignal.v1.location-preference"

interface PersistedReportCenterState {
  hydrated: boolean
  localReports: ReportRecord[]
  savedDraft: SavedDraft | null
  localNotifications: AppNotification[]
  recentTrackedNumbers: string[]
  pendingSubmissions: PendingSubmission[]
}

type PersistedReportCenterAction =
  | {
      type: "hydrate"
      payload: Omit<PersistedReportCenterState, "hydrated">
    }
  | {
      type: "saveDraft"
      draft: SavedDraft
    }
  | {
      type: "clearDraft"
    }
  | {
      type: "submitReport"
      report: ReportRecord
      notification: AppNotification
    }
  | {
      type: "queueSubmission"
      pendingSubmission: PendingSubmission
      notification: AppNotification
    }
  | {
      type: "completeQueuedSubmission"
      pendingSubmissionId: string
      report: ReportRecord
      notification: AppNotification
    }
  | {
      type: "markNotificationRead"
      id: string
    }
  | {
      type: "rememberTrackedTicket"
      trackingNumber: string
    }

interface ReportCenterContextValue {
  hydrated: boolean
  reports: ReportRecord[]
  notices: typeof publicNotices
  notifications: AppNotification[]
  savedDraft: SavedDraft | null
  pendingSubmissions: PendingSubmission[]
  recentTrackedReports: ReportRecord[]
  selectedArea: string
  selectedCoordinates: ReportCoordinates | null
  locationPreference: SavedLocationPreference
  isSyncingPendingSubmissions: boolean
  setSelectedArea: (value: string) => void
  saveManualLocation: (input: {
    label: string
    coordinates?: ReportCoordinates | null
  }) => void
  requestDeviceLocation: (options?: {
    force?: boolean
    fallbackLabel?: string
  }) => Promise<{
    status: "granted" | "denied" | "unavailable"
    preference: SavedLocationPreference
  }>
  saveDraft: (draft: SavedDraft) => void
  clearDraft: () => void
  submitReport: (input: ReportSubmissionInput) => Promise<SubmitReportResult>
  findReportByTrackingNumber: (trackingNumber: string) => ReportRecord | undefined
  findPendingSubmissionById: (id: string) => PendingSubmission | undefined
  flushPendingSubmissions: () => Promise<void>
  rememberTrackedTicket: (trackingNumber: string) => void
  markNotificationRead: (id: string) => void
}

const ReportCenterContext = createContext<ReportCenterContextValue | null>(null)

const initialPersistedState: PersistedReportCenterState = {
  hydrated: false,
  localReports: [],
  savedDraft: null,
  localNotifications: [],
  recentTrackedNumbers: [],
  pendingSubmissions: [],
}

function persistedStateReducer(
  state: PersistedReportCenterState,
  action: PersistedReportCenterAction
) {
  switch (action.type) {
    case "hydrate":
      return {
        hydrated: true,
        localReports: action.payload.localReports,
        savedDraft: action.payload.savedDraft,
        localNotifications: action.payload.localNotifications,
        recentTrackedNumbers: action.payload.recentTrackedNumbers,
        pendingSubmissions: action.payload.pendingSubmissions,
      }
    case "saveDraft":
      return {
        ...state,
        savedDraft: action.draft,
      }
    case "clearDraft":
      return {
        ...state,
        savedDraft: null,
      }
    case "submitReport":
      return {
        ...state,
        localReports: [action.report, ...state.localReports],
        localNotifications: [action.notification, ...state.localNotifications],
        savedDraft: null,
      }
    case "queueSubmission":
      return {
        ...state,
        pendingSubmissions: [action.pendingSubmission, ...state.pendingSubmissions],
        localNotifications: [action.notification, ...state.localNotifications],
        savedDraft: null,
      }
    case "completeQueuedSubmission":
      return {
        ...state,
        localReports: [action.report, ...state.localReports],
        localNotifications: [action.notification, ...state.localNotifications],
        recentTrackedNumbers: [
          action.report.trackingNumber,
          ...state.recentTrackedNumbers.filter(
            (value) => value !== action.report.trackingNumber
          ),
        ].slice(0, 6),
        pendingSubmissions: state.pendingSubmissions.filter(
          (entry) => entry.id !== action.pendingSubmissionId
        ),
      }
    case "markNotificationRead":
      return {
        ...state,
        localNotifications: state.localNotifications.map((notification) =>
          notification.id === action.id
            ? {
                ...notification,
                read: true,
              }
            : notification
        ),
      }
    case "rememberTrackedTicket":
      return {
        ...state,
        recentTrackedNumbers: [
          action.trackingNumber,
          ...state.recentTrackedNumbers.filter((value) => value !== action.trackingNumber),
        ].slice(0, 6),
      }
    default:
      return state
  }
}

function parseStoredValue<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback
  }

  const raw = window.localStorage.getItem(key)

  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function createTrackingNumber() {
  const today = new Date().toISOString().slice(0, 10).replaceAll("-", "")
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `EKI-${today}-${suffix}`
}

function createPendingSubmissionId() {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `PENDING-${suffix}`
}

function defaultLocationPreference(label = "Ado-Ekiti, Nigeria"): SavedLocationPreference {
  return {
    label,
    permission: "unknown",
    source: "default",
    updatedAt: new Date().toISOString(),
  }
}

function normalizeLocationLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/,?\s*nigeria$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function resolveSavedAreaCoordinates(
  label: string,
  reports: ReportRecord[]
): ReportCoordinates | null {
  const normalizedLabel = normalizeLocationLabel(label)

  if (!normalizedLabel) {
    return null
  }

  const match = reports.find((report) => {
    if (!report.location.coordinates) {
      return false
    }

    const candidates = [
      report.location.area,
      report.location.community,
      report.location.lga,
      report.location.landmark,
      `${report.location.community}, Nigeria`,
      `${report.location.lga}, Nigeria`,
    ].filter(Boolean) as string[]

    return candidates.some((candidate) => normalizeLocationLabel(candidate) === normalizedLabel)
  })

  return match?.location.coordinates ?? null
}

function resolveManualFallbackCoordinates(
  label: string,
  reports: ReportRecord[],
  currentPreference: SavedLocationPreference,
  explicitCoordinates?: ReportCoordinates | null
) {
  return (
    explicitCoordinates ??
    resolveSavedAreaCoordinates(label, reports) ??
    (currentPreference.source === "manual" ? currentPreference.coordinates : undefined)
  )
}

function createReportRecord(
  input: ReportSubmissionInput,
  options?: {
    trackingNumber?: string
    createdAt?: string
    deliveryState?: ReportRecord["deliveryState"]
  }
) {
  const trackingNumber = options?.trackingNumber ?? createTrackingNumber()
  const now = options?.createdAt ?? new Date().toISOString()
  const routing = resolveRoutingDecision({
    category: input.category,
    location: {
      lga: input.location.lga,
      ward: input.location.ward,
    },
  })

  return {
    id: trackingNumber,
    trackingNumber,
    kind: input.kind,
    category: input.category,
    severity: input.severity,
    isAnonymous: input.isAnonymous,
    status: "Received",
    title: input.title,
    description: input.description,
    location: input.location,
    contact: input.contact,
    media: input.media,
    assignedOfficeId: routing.office.id,
    assignedOfficeName: routing.office.name,
    estimatedResponse: getEstimatedResponse(input.severity),
    createdAt: now,
    updatedAt: now,
    isPublic: true,
    source: "submitted",
    deliveryState: options?.deliveryState ?? "device-only",
    updates: [
      {
        id: `${trackingNumber}-received`,
        title: "Report received",
        note: "Your report has been logged and is waiting for screening and assignment.",
        status: "Received",
        actorName: "EkiSignal Intake",
        actorRole: "Citizen platform",
        visibility: "public",
        createdAt: now,
      },
    ],
  } satisfies ReportRecord
}

function createSubmissionNotification(report: ReportRecord): AppNotification {
  return {
    id: `${report.trackingNumber}-notification`,
    title: `Tracking number ${report.trackingNumber} created`,
    body: `Your report has been routed to ${report.assignedOfficeName}.`,
    kind: "status",
    createdAt: report.createdAt,
    read: false,
  }
}

function createQueuedNotification(pendingSubmission: PendingSubmission): AppNotification {
  return {
    id: `${pendingSubmission.id}-queued`,
    title: "Report saved offline",
    body: "We will create the tracking ticket automatically when your connection is back.",
    kind: "system",
    createdAt: pendingSubmission.queuedAt,
    read: false,
  }
}

function toQueuedSubmission(input: ReportSubmissionInput): PendingSubmission {
  return {
    id: createPendingSubmissionId(),
    queuedAt: new Date().toISOString(),
    payload: {
      ...input,
      media: [],
    },
  }
}

export function ReportCenterProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { hydrated: authHydrated, session } = useAuth()
  const { isOnline } = usePwa()
  const [persistedState, dispatch] = useReducer(
    persistedStateReducer,
    initialPersistedState
  )
  const [locationPreference, setLocationPreference] = useState<SavedLocationPreference>(
    defaultLocationPreference()
  )
  const [isSyncingPendingSubmissions, setIsSyncingPendingSubmissions] = useState(false)
  const syncInFlightRef = useRef(false)
  const locationHydratedRef = useRef(false)
  const locationPreferenceRef = useRef(locationPreference)
  const {
    hydrated,
    localNotifications,
    localReports,
    pendingSubmissions,
    recentTrackedNumbers,
    savedDraft,
  } = persistedState

  useEffect(() => {
    dispatch({
      type: "hydrate",
      payload: {
        localReports: parseStoredValue(LOCAL_REPORTS_KEY, []),
        localNotifications: parseStoredValue(LOCAL_NOTIFICATIONS_KEY, []),
        recentTrackedNumbers: parseStoredValue(LOCAL_TRACKED_KEY, []),
        savedDraft: parseStoredValue(LOCAL_DRAFT_KEY, null),
        pendingSubmissions: parseStoredValue(LOCAL_PENDING_KEY, []),
      },
    })
  }, [])

  useEffect(() => {
    if (!authHydrated || locationHydratedRef.current || typeof window === "undefined") {
      return
    }

    const fallbackLabel = session?.defaultLocation ?? "Ado-Ekiti, Nigeria"
    const storedLocation = parseStoredValue<SavedLocationPreference | null>(
      LOCAL_LOCATION_KEY,
      null
    )

    setLocationPreference(
      storedLocation
        ? {
            ...defaultLocationPreference(fallbackLabel),
            ...storedLocation,
            label: storedLocation.label || fallbackLabel,
          }
        : defaultLocationPreference(fallbackLabel)
    )
    locationHydratedRef.current = true
  }, [authHydrated, session?.defaultLocation])

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return
    }

    window.localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(localReports))
    window.localStorage.setItem(
      LOCAL_NOTIFICATIONS_KEY,
      JSON.stringify(localNotifications)
    )
    window.localStorage.setItem(LOCAL_TRACKED_KEY, JSON.stringify(recentTrackedNumbers))
    window.localStorage.setItem(
      LOCAL_PENDING_KEY,
      JSON.stringify(pendingSubmissions)
    )

    if (savedDraft) {
      window.localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(savedDraft))
      return
    }

    window.localStorage.removeItem(LOCAL_DRAFT_KEY)
  }, [
    hydrated,
    localNotifications,
    localReports,
    pendingSubmissions,
    recentTrackedNumbers,
    savedDraft,
  ])

  useEffect(() => {
    if (!locationHydratedRef.current || typeof window === "undefined") {
      return
    }

    window.localStorage.setItem(LOCAL_LOCATION_KEY, JSON.stringify(locationPreference))
  }, [locationPreference])

  useEffect(() => {
    locationPreferenceRef.current = locationPreference
  }, [locationPreference])

  useEffect(() => {
    if (!authHydrated || !session?.defaultLocation || !locationHydratedRef.current) {
      return
    }

    setLocationPreference((current) =>
      current.source === "default" && current.label !== session.defaultLocation
        ? {
            ...current,
            label: session.defaultLocation,
            updatedAt: new Date().toISOString(),
          }
        : current
    )
  }, [authHydrated, session?.defaultLocation])

  const reports = useMemo(
    () =>
      [...localReports, ...demoReports].toSorted(
        (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
      ),
    [localReports]
  )

  const notifications = useMemo(
    () =>
      [...localNotifications, ...demoNotifications].toSorted(
        (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
      ),
    [localNotifications]
  )

  const recentTrackedReports = useMemo(
    () =>
      recentTrackedNumbers
        .map((trackingNumber) =>
          reports.find(
            (report) => report.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()
          )
        )
        .filter((report): report is ReportRecord => Boolean(report)),
    [recentTrackedNumbers, reports]
  )

  const selectedArea = locationPreference.label
  const selectedCoordinates = useMemo(() => {
    if (
      locationPreference.source === "device" &&
      locationPreference.permission === "granted" &&
      (locationPreference.coordinates || locationPreference.lastKnownCoordinates)
    ) {
      return locationPreference.coordinates ?? locationPreference.lastKnownCoordinates ?? null
    }

    if (locationPreference.source === "manual" && locationPreference.coordinates) {
      return locationPreference.coordinates
    }

    return resolveSavedAreaCoordinates(locationPreference.label, reports)
  }, [
    locationPreference.coordinates,
    locationPreference.label,
    locationPreference.lastKnownCoordinates,
    locationPreference.permission,
    locationPreference.source,
    reports,
  ])

  const setSelectedArea = useCallback((value: string) => {
    const nextLabel = value.trim()

    if (!nextLabel) {
      return
    }

    setLocationPreference((current) => {
      const nextPreference = {
        ...current,
        label: nextLabel,
        source: "manual" as const,
        coordinates: resolveManualFallbackCoordinates(nextLabel, reports, current),
        updatedAt: new Date().toISOString(),
      }

      locationPreferenceRef.current = nextPreference
      return nextPreference
    })
  }, [reports])

  const saveManualLocation = useCallback(
    (input: { label: string; coordinates?: ReportCoordinates | null }) => {
      const nextLabel = input.label.trim()

      if (!nextLabel) {
        return
      }

      setLocationPreference((current) => {
        const nextPreference = {
          ...current,
          label: nextLabel,
          source: "manual" as const,
          coordinates: resolveManualFallbackCoordinates(
            nextLabel,
            reports,
            current,
            input.coordinates
          ),
          updatedAt: new Date().toISOString(),
        }

        locationPreferenceRef.current = nextPreference
        return nextPreference
      })
    },
    [reports]
  )

  const requestDeviceLocation = useCallback(
    async (options?: { force?: boolean; fallbackLabel?: string }) => {
      const currentPreference = locationPreferenceRef.current

      if (
        !options?.force &&
        currentPreference.permission === "granted" &&
        currentPreference.coordinates
      ) {
        return {
          status: "granted" as const,
          preference: currentPreference,
        }
      }

      if (!options?.force && currentPreference.permission === "denied") {
        return {
          status: "denied" as const,
          preference: currentPreference,
        }
      }

      const nextLabel =
        options?.fallbackLabel?.trim() ||
        currentPreference.label ||
        "Ado-Ekiti, Nigeria"

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        const nextPreference: SavedLocationPreference = {
          ...currentPreference,
          label: nextLabel,
          permission: "denied",
          source: "manual",
          coordinates: resolveManualFallbackCoordinates(
            nextLabel,
            reports,
            currentPreference
          ),
          lastKnownCoordinates:
            currentPreference.lastKnownCoordinates ?? currentPreference.coordinates,
          updatedAt: new Date().toISOString(),
        }
        locationPreferenceRef.current = nextPreference
        startTransition(() => {
          setLocationPreference(nextPreference)
        })

        return {
          status: "unavailable" as const,
          preference: nextPreference,
        }
      }

      return new Promise<{
        status: "granted" | "denied" | "unavailable"
        preference: SavedLocationPreference
      }>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const nextPreference: SavedLocationPreference = {
              ...currentPreference,
              label: nextLabel,
              permission: "granted",
              source: "device",
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              lastKnownCoordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              updatedAt: new Date().toISOString(),
            }

            locationPreferenceRef.current = nextPreference
            startTransition(() => {
              setLocationPreference(nextPreference)
            })
            resolve({
              status: "granted" as const,
              preference: nextPreference,
            })
          },
          () => {
            const nextPreference: SavedLocationPreference = {
              ...currentPreference,
              label: nextLabel,
              permission: "denied",
              source: "manual",
              coordinates: resolveManualFallbackCoordinates(
                nextLabel,
                reports,
                currentPreference
              ),
              lastKnownCoordinates:
                currentPreference.lastKnownCoordinates ?? currentPreference.coordinates,
              updatedAt: new Date().toISOString(),
            }

            locationPreferenceRef.current = nextPreference
            startTransition(() => {
              setLocationPreference(nextPreference)
            })
            resolve({
              status: "denied" as const,
              preference: nextPreference,
            })
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000 * 60 * 15,
            timeout: 9000,
          }
        )
      })
    },
    [reports]
  )

  const saveDraft = useCallback((draft: SavedDraft) => {
    dispatch({
      type: "saveDraft",
      draft,
    })
  }, [])

  const clearDraft = useCallback(() => {
    dispatch({
      type: "clearDraft",
    })
  }, [])

  const createSubmittedReport = useCallback((input: ReportSubmissionInput) => {
    const report = createReportRecord(input)

    dispatch({
      type: "submitReport",
      report,
      notification: createSubmissionNotification(report),
    })

    return report
  }, [])

  const flushPendingSubmissions = useCallback(async () => {
    if (!hydrated || !isOnline || pendingSubmissions.length === 0 || syncInFlightRef.current) {
      return
    }

    syncInFlightRef.current = true
    setIsSyncingPendingSubmissions(true)

    try {
      const queuedInOrder = [...pendingSubmissions].toSorted(
        (left, right) => Date.parse(left.queuedAt) - Date.parse(right.queuedAt)
      )

      for (const pendingSubmission of queuedInOrder) {
        const report = createReportRecord(pendingSubmission.payload, {
          createdAt: new Date().toISOString(),
        })

        dispatch({
          type: "completeQueuedSubmission",
          pendingSubmissionId: pendingSubmission.id,
          report,
          notification: {
            id: `${pendingSubmission.id}-synced`,
            title: `Offline report ${report.trackingNumber} is now ready`,
            body: `Your saved submission has been restored into the live citizen timeline for ${report.assignedOfficeName}.`,
            kind: "status",
            createdAt: new Date().toISOString(),
            read: false,
          },
        })
      }
    } finally {
      syncInFlightRef.current = false
      setIsSyncingPendingSubmissions(false)
    }
  }, [hydrated, isOnline, pendingSubmissions])

  useEffect(() => {
    if (!hydrated || !isOnline || pendingSubmissions.length === 0) {
      return
    }

    void flushPendingSubmissions()
  }, [flushPendingSubmissions, hydrated, isOnline, pendingSubmissions.length])

  const submitReport = useCallback(
    async (input: ReportSubmissionInput): Promise<SubmitReportResult> => {
      if (!isOnline) {
        if (input.media.length > 0) {
          return {
            outcome: "saved_draft",
          }
        }

        const pendingSubmission = toQueuedSubmission(input)

        dispatch({
          type: "queueSubmission",
          pendingSubmission,
          notification: createQueuedNotification(pendingSubmission),
        })

        return {
          outcome: "queued",
          pendingSubmission,
        }
      }

      const report = createSubmittedReport(input)

      return {
        outcome: "submitted",
        report,
      }
    },
    [createSubmittedReport, isOnline]
  )

  const findReportByTrackingNumber = useCallback(
    (trackingNumber: string) =>
      reports.find(
        (report) => report.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()
      ),
    [reports]
  )

  const findPendingSubmissionById = useCallback(
    (id: string) => pendingSubmissions.find((entry) => entry.id === id),
    [pendingSubmissions]
  )

  const rememberTrackedTicket = useCallback((trackingNumber: string) => {
    dispatch({
      type: "rememberTrackedTicket",
      trackingNumber,
    })
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    dispatch({
      type: "markNotificationRead",
      id,
    })
  }, [])

  const value = useMemo<ReportCenterContextValue>(
    () => ({
      hydrated,
      reports,
      notices: publicNotices,
      notifications,
      savedDraft,
      pendingSubmissions,
      recentTrackedReports,
      selectedArea,
      selectedCoordinates,
      locationPreference,
      isSyncingPendingSubmissions,
      setSelectedArea,
      saveManualLocation,
      requestDeviceLocation,
      saveDraft,
      clearDraft,
      submitReport,
      findReportByTrackingNumber,
      findPendingSubmissionById,
      flushPendingSubmissions,
      rememberTrackedTicket,
      markNotificationRead,
    }),
    [
      clearDraft,
      findPendingSubmissionById,
      findReportByTrackingNumber,
      flushPendingSubmissions,
      hydrated,
      isSyncingPendingSubmissions,
      markNotificationRead,
      notifications,
      pendingSubmissions,
      locationPreference,
      requestDeviceLocation,
      recentTrackedReports,
      rememberTrackedTicket,
      reports,
      saveManualLocation,
      saveDraft,
      savedDraft,
      selectedCoordinates,
      selectedArea,
      setSelectedArea,
      submitReport,
    ]
  )

  return (
    <ReportCenterContext.Provider value={value}>
      {children}
    </ReportCenterContext.Provider>
  )
}

export function useReportCenter() {
  const context = useContext(ReportCenterContext)

  if (!context) {
    throw new Error("useReportCenter must be used within ReportCenterProvider")
  }

  return context
}
