export const reportKinds = ["report", "complaint", "suggestion"] as const
export const reportCategories = [
  "Road",
  "Drainage",
  "Water",
  "Electricity",
  "Sanitation",
  "Health",
  "Security",
  "Education",
  "Environment",
  "Public Facility",
  "Corruption / Service Delay",
  "Other",
] as const
export const reportSeverities = ["routine", "urgent", "critical"] as const
export const reportStatuses = [
  "Received",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Rejected",
] as const

export type ReportKind = (typeof reportKinds)[number]
export type ReportCategory = (typeof reportCategories)[number]
export type ReportSeverity = (typeof reportSeverities)[number]
export type ReportStatus = (typeof reportStatuses)[number]
export type ReportDeliveryState = "synced" | "device-only"

export type OfficeType =
  | "ministry"
  | "department"
  | "agency"
  | "moderation"
  | "default-queue"

export interface EkitiLga {
  name: string
  headquarters: string
  communities: string[]
  wards: string[]
}

export interface ReportCoordinates {
  lat: number
  lng: number
}

export type SavedLocationPermission = "unknown" | "granted" | "denied"
export type SavedLocationSource = "default" | "device" | "manual"

export interface SavedLocationPreference {
  label: string
  permission: SavedLocationPermission
  source: SavedLocationSource
  coordinates?: ReportCoordinates
  lastKnownCoordinates?: ReportCoordinates
  updatedAt: string
}

export interface ReportMedia {
  id: string
  name: string
  kind: "image" | "video" | "document"
  sizeLabel: string
  mimeType?: string
  previewUrl?: string
}

export interface ReportLocation {
  state: string
  lga: string
  community: string
  ward: string
  area: string
  landmark: string
  coordinates?: ReportCoordinates
}

export interface ContactDetails {
  name: string
  phone: string
  email?: string
}

export interface ReportUpdate {
  id: string
  title: string
  note: string
  status: ReportStatus
  actorName: string
  actorRole: string
  visibility: "public" | "internal"
  isEscalation?: boolean
  createdAt: string
}

export interface ReportRecord {
  id: string
  trackingNumber: string
  kind: ReportKind
  category: ReportCategory
  severity: ReportSeverity
  isAnonymous: boolean
  status: ReportStatus
  title: string
  description: string
  location: ReportLocation
  contact: ContactDetails
  media: ReportMedia[]
  assignedOfficeId: string
  assignedOfficeName: string
  estimatedResponse: string
  createdAt: string
  updatedAt: string
  isPublic: boolean
  source: "demo" | "submitted"
  /** Distinguishes supplied positions from rough area estimates. */
  mapPositionKind?: "provided" | "approximate"
  deliveryState?: ReportDeliveryState
  civicPoints?: number
  rewardStatus?: "under_review" | "eligible" | "rewarded" | "not_eligible"
  verificationLabel?: string
  updates: ReportUpdate[]
}

export interface OfficeRecord {
  id: string
  name: string
  type: OfficeType
  description: string
  email: string
  coverage: string[]
  categories: ReportCategory[]
}

export interface RoutingRule {
  id: string
  label: string
  priority: number
  category?: ReportCategory
  lga?: string
  ward?: string
  officeId: string
  fallback?: boolean
}

export interface RoutingDecision {
  office: OfficeRecord
  rule: RoutingRule
}

export interface PublicNotice {
  id: string
  title: string
  body: string
  area: string
  createdAt: string
  tone: "default" | "warning" | "success"
  office?: string
  category?: ReportCategory | "General"
  impactLabel?: string
}

export interface AppNotification {
  id: string
  title: string
  body: string
  kind: "assignment" | "status" | "notice" | "system" | "reward" | "impact"
  createdAt: string
  read: boolean
}

export interface TrustMetric {
  id: string
  label: string
  value: string
  detail: string
}

export interface CivicProfile {
  fullName: string
  areaLabel: string
  memberSince: string
  trustTier: string
  civicScore: number
  nextTierScore: number
  verifiedReports: number
  reportsSubmitted: number
  reportsResolved: number
  rewardsEarned: string
  rewardEligibleCount: number
  impactSummary: string
}

export interface CivicRewardEntry {
  id: string
  title: string
  reportTrackingNumber?: string
  points: number
  state: "under_review" | "eligible" | "rewarded" | "not_eligible"
  createdAt: string
  note: string
  amountLabel?: string
}

export interface TransparencySnapshot {
  id: string
  month: string
  totalDonations: string
  rewardsDisbursed: string
  citizensRewarded: number
  verifiedReportsSupported: number
  moderationCoverage: string
  publishedAt: string
}

export interface TransparencyEntry {
  id: string
  title: string
  amountLabel?: string
  body: string
  createdAt: string
}

export interface ProcessStep {
  id: string
  title: string
  body: string
}

export interface SavedDraft {
  kind: ReportKind
  category: ReportCategory
  severity: ReportSeverity
  isAnonymous: boolean
  title: string
  description: string
  location: ReportLocation
  contact: ContactDetails
}

export interface ReportSubmissionInput {
  kind: ReportKind
  category: ReportCategory
  severity: ReportSeverity
  isAnonymous: boolean
  title: string
  description: string
  location: ReportLocation
  contact: ContactDetails
  media: ReportMedia[]
}

export interface PendingSubmission {
  id: string
  queuedAt: string
  payload: ReportSubmissionInput
}

export interface SubmitReportResult {
  outcome: "submitted" | "queued" | "saved_draft"
  report?: ReportRecord
  pendingSubmission?: PendingSubmission
}
