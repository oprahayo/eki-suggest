import { ekitiState } from "@/lib/ekiti"
import { getEstimatedResponse, resolveRoutingDecision } from "@/lib/routing"
import type {
  AppNotification,
  CivicProfile,
  CivicRewardEntry,
  ProcessStep,
  PublicNotice,
  ReportCategory,
  ReportRecord,
  ReportStatus,
  ReportUpdate,
  TransparencyEntry,
  TransparencySnapshot,
  TrustMetric,
} from "@/lib/types"

function update(
  id: string,
  status: ReportStatus,
  title: string,
  note: string,
  createdAt: string,
  actorName: string,
  actorRole: string,
  visibility: "public" | "internal" = "public",
  options?: {
    isEscalation?: boolean
  }
): ReportUpdate {
  return {
    id,
    status,
    title,
    note,
    createdAt,
    actorName,
    actorRole,
    visibility,
    isEscalation: options?.isEscalation,
  }
}

function buildDemoReport(input: {
  trackingNumber: string
  kind: ReportRecord["kind"]
  category: ReportCategory
  severity: ReportRecord["severity"]
  isAnonymous?: boolean
  status: ReportStatus
  title: string
  description: string
  lga: string
  community: string
  ward: string
  area: string
  landmark: string
  createdAt: string
  updatedAt: string
  contact: ReportRecord["contact"]
  coordinates?: ReportRecord["location"]["coordinates"]
  media?: ReportRecord["media"]
  civicPoints?: number
  rewardStatus?: ReportRecord["rewardStatus"]
  verificationLabel?: string
  updates: ReportUpdate[]
}) {
  const routing = resolveRoutingDecision({
    category: input.category,
    location: {
      lga: input.lga,
      ward: input.ward,
    },
  })

  return {
    id: input.trackingNumber,
    trackingNumber: input.trackingNumber,
    kind: input.kind,
    category: input.category,
    severity: input.severity,
    isAnonymous: input.isAnonymous ?? false,
    status: input.status,
    title: input.title,
    description: input.description,
    location: {
      state: ekitiState,
      lga: input.lga,
      community: input.community,
      ward: input.ward,
      area: input.area,
      landmark: input.landmark,
      coordinates: input.coordinates,
    },
    contact: input.contact,
    media: input.media ?? [],
    assignedOfficeId: routing.office.id,
    assignedOfficeName: routing.office.name,
    estimatedResponse: getEstimatedResponse(input.severity),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    isPublic: true,
    source: "demo" as const,
    civicPoints: input.civicPoints,
    rewardStatus: input.rewardStatus,
    verificationLabel: input.verificationLabel,
    updates: input.updates,
  } satisfies ReportRecord
}

export const demoReports: ReportRecord[] = [
  buildDemoReport({
    trackingNumber: "EKI-20260328-A1D3Q9",
    kind: "report",
    category: "Road",
    severity: "urgent",
    status: "Under Review",
    title: "Deep potholes around Fajuyi axis after rainfall",
    description:
      "Residents are swerving into oncoming traffic to avoid a damaged stretch near the market corridor.",
    lga: "Ado Ekiti",
    community: "Ado-Ekiti",
    ward: "ADO 'F' OKEYINMI",
    area: "Fajuyi corridor",
    landmark: "Near Fajuyi Memorial Park",
    createdAt: "2026-03-28T07:20:00.000Z",
    updatedAt: "2026-03-28T09:15:00.000Z",
    civicPoints: 22,
    rewardStatus: "under_review",
    verificationLabel: "Verification in progress",
    contact: {
      name: "Bisi Adebayo",
      phone: "0803 000 1122",
      email: "bisi@example.com",
    },
    coordinates: {
      lat: 7.6218,
      lng: 5.2203,
    },
    media: [
      {
        id: "media-road-1",
        name: "fajuyi-corridor-damage.svg",
        kind: "image",
        sizeLabel: "1.2 MB",
        mimeType: "image/svg+xml",
        previewUrl: "/demo-media/road-fajuyi.svg",
      },
    ],
    updates: [
      update(
        "u-road-1",
        "Received",
        "Report received",
        "Your report was logged and assigned a tracking number.",
        "2026-03-28T07:20:00.000Z",
        "EkiSignal Intake",
        "Citizen platform"
      ),
      update(
        "u-road-2",
        "Under Review",
        "Screened for routing",
        "The report has been checked and is now waiting for assignment into the works queue.",
        "2026-03-28T09:15:00.000Z",
        "Moderation Desk",
        "Moderator"
      ),
    ],
  }),
  buildDemoReport({
    trackingNumber: "EKI-20260327-W8K2L4",
    kind: "complaint",
    category: "Water",
    severity: "critical",
    status: "In Progress",
    title: "Burst pipe leaving Ikere lane flooded",
    description:
      "Water has been running continuously since yesterday and households on the stretch have no controlled supply.",
    lga: "Ikere",
    community: "Ikere-Ekiti",
    ward: "OKERUKU",
    area: "Okeruku junction",
    landmark: "Near St. Louis Primary School",
    createdAt: "2026-03-27T13:40:00.000Z",
    updatedAt: "2026-03-28T06:30:00.000Z",
    civicPoints: 34,
    rewardStatus: "eligible",
    verificationLabel: "Evidence verified",
    contact: {
      name: "Aanu Kolawole",
      phone: "0814 001 0022",
    },
    coordinates: {
      lat: 7.4971,
      lng: 5.2304,
    },
    media: [
      {
        id: "media-water-1",
        name: "ikere-burst-pipe.svg",
        kind: "image",
        sizeLabel: "980 KB",
        mimeType: "image/svg+xml",
        previewUrl: "/demo-media/water-ikere.svg",
      },
    ],
    updates: [
      update(
        "u-water-1",
        "Received",
        "Report received",
        "Submission logged and routed for urgent review.",
        "2026-03-27T13:40:00.000Z",
        "EkiSignal Intake",
        "Citizen platform"
      ),
      update(
        "u-water-2",
        "Assigned",
        "Assigned to office",
        "Ikere Water Board Queue accepted the ticket for field action.",
        "2026-03-27T15:05:00.000Z",
        "Routing Engine",
        "Automation"
      ),
      update(
        "u-water-2b",
        "Assigned",
        "Escalated for urgent field response",
        "The issue was escalated to the regional maintenance lead because continuous loss risk was affecting nearby households.",
        "2026-03-27T18:10:00.000Z",
        "Moderation Desk",
        "Moderator",
        "public",
        {
          isEscalation: true,
        }
      ),
      update(
        "u-water-3",
        "In Progress",
        "Field inspection underway",
        "Technicians are on-site and have begun isolation of the damaged line.",
        "2026-03-28T06:30:00.000Z",
        "Engr. Oladapo",
        "Water Board"
      ),
    ],
  }),
  buildDemoReport({
    trackingNumber: "EKI-20260326-S5J7M2",
    kind: "report",
    category: "Sanitation",
    severity: "routine",
    status: "Assigned",
    title: "Refuse overflow around Iworoko road entrance",
    description:
      "Waste is spilling onto the shoulder and drainage, especially during the evening traffic peak.",
    lga: "Irepodun / Ifelodun",
    community: "Iworoko",
    ward: "IWOROKO",
    area: "Iworoko entrance",
    landmark: "Opposite community junction",
    createdAt: "2026-03-26T08:00:00.000Z",
    updatedAt: "2026-03-27T16:00:00.000Z",
    civicPoints: 16,
    rewardStatus: "under_review",
    verificationLabel: "Moderation cleared",
    contact: {
      name: "Temi Aluko",
      phone: "0905 111 1212",
      email: "temi@example.com",
    },
    coordinates: {
      lat: 7.6801,
      lng: 5.2876,
    },
    media: [
      {
        id: "media-sanitation-1",
        name: "iworoko-refuse-overflow.svg",
        kind: "image",
        sizeLabel: "1.0 MB",
        mimeType: "image/svg+xml",
        previewUrl: "/demo-media/sanitation-iworoko.svg",
      },
    ],
    updates: [
      update(
        "u-san-1",
        "Received",
        "Report received",
        "Issue logged successfully.",
        "2026-03-26T08:00:00.000Z",
        "EkiSignal Intake",
        "Citizen platform"
      ),
      update(
        "u-san-2",
        "Assigned",
        "Assigned to environmental desk",
        "Environmental Health Response Desk scheduled cleanup and inspection.",
        "2026-03-27T16:00:00.000Z",
        "Routing Desk",
        "Moderator"
      ),
    ],
  }),
  buildDemoReport({
    trackingNumber: "EKI-20260326-C7V4B6",
    kind: "complaint",
    category: "Corruption / Service Delay",
    severity: "urgent",
    status: "Assigned",
    title: "Unofficial payment request delaying permit file movement",
    description:
      "A citizen reported repeated requests for unofficial cash before a routine approval file would move to the next desk.",
    lga: "Ado Ekiti",
    community: "Ado-Ekiti",
    ward: "ADO 'B' IRONA",
    area: "State secretariat corridor",
    landmark: "Near the permit service block",
    createdAt: "2026-03-26T12:15:00.000Z",
    updatedAt: "2026-03-27T09:05:00.000Z",
    civicPoints: 0,
    rewardStatus: "under_review",
    verificationLabel: "Sensitive review in progress",
    contact: {
      name: "Anonymous citizen",
      phone: "0800 300 1000",
    },
    coordinates: {
      lat: 7.6135,
      lng: 5.2285,
    },
    updates: [
      update(
        "u-integrity-1",
        "Received",
        "Complaint received",
        "The complaint was logged with restricted visibility because it concerns service conduct.",
        "2026-03-26T12:15:00.000Z",
        "EkiSignal Intake",
        "Citizen platform"
      ),
      update(
        "u-integrity-2",
        "Under Review",
        "Sensitive moderation review",
        "Moderation confirmed the submission contained enough detail for integrity review without exposing the complainant publicly.",
        "2026-03-26T15:40:00.000Z",
        "Moderation Desk",
        "Moderator"
      ),
      update(
        "u-integrity-3",
        "Assigned",
        "Assigned to integrity queue",
        "The case has been transferred to the Integrity and Moderation Queue for protected follow-up.",
        "2026-03-27T09:05:00.000Z",
        "Routing Engine",
        "Automation"
      ),
    ],
  }),
  buildDemoReport({
    trackingNumber: "EKI-20260325-E9H1D8",
    kind: "suggestion",
    category: "Education",
    severity: "routine",
    status: "Resolved",
    title: "Community noticeboard for school feeding schedule",
    description:
      "Parents suggested a visible noticeboard so feeding schedules and PTA announcements stay accessible.",
    lga: "Oye",
    community: "Oye-Ekiti",
    ward: "OYE I",
    area: "Community school cluster",
    landmark: "Near Oye civic square",
    createdAt: "2026-03-25T10:10:00.000Z",
    updatedAt: "2026-03-27T11:30:00.000Z",
    civicPoints: 28,
    rewardStatus: "rewarded",
    verificationLabel: "Community confirmation received",
    contact: {
      name: "Abiola Fadeyi",
      phone: "0809 400 5000",
    },
    coordinates: {
      lat: 7.7984,
      lng: 5.3329,
    },
    updates: [
      update(
        "u-edu-1",
        "Received",
        "Suggestion received",
        "The idea was logged and sent to the education desk.",
        "2026-03-25T10:10:00.000Z",
        "EkiSignal Intake",
        "Citizen platform"
      ),
      update(
        "u-edu-2",
        "Resolved",
        "Public notice accepted",
        "The local education supervisor approved a pilot noticeboard for the school cluster.",
        "2026-03-27T11:30:00.000Z",
        "Mrs. Akinwale",
        "Education Monitoring Desk"
      ),
    ],
  }),
  buildDemoReport({
    trackingNumber: "EKI-20260324-F2P5R7",
    kind: "complaint",
    category: "Public Facility",
    severity: "urgent",
    status: "Closed",
    title: "Broken toilet facility at neighbourhood market",
    description:
      "The market toilet block was repaired after repeated complaints and has now been reopened.",
    lga: "Ado Ekiti",
    community: "Ado-Ekiti",
    ward: "ADO 'J' OKESA",
    area: "Oja Bisi market",
    landmark: "South entrance",
    createdAt: "2026-03-24T09:00:00.000Z",
    updatedAt: "2026-03-26T14:50:00.000Z",
    civicPoints: 24,
    rewardStatus: "rewarded",
    verificationLabel: "Resolution verified",
    contact: {
      name: "Shade Akin",
      phone: "0812 991 0001",
    },
    coordinates: {
      lat: 7.6212,
      lng: 5.2148,
    },
    media: [
      {
        id: "media-facility-1",
        name: "market-facility-block.svg",
        kind: "image",
        sizeLabel: "1.1 MB",
        mimeType: "image/svg+xml",
        previewUrl: "/demo-media/facility-market.svg",
      },
    ],
    updates: [
      update(
        "u-fac-1",
        "Received",
        "Complaint received",
        "Complaint recorded and sent to the maintenance team.",
        "2026-03-24T09:00:00.000Z",
        "EkiSignal Intake",
        "Citizen platform"
      ),
      update(
        "u-fac-2",
        "In Progress",
        "Repairs underway",
        "Contractor accessed the facility and started plumbing repairs.",
        "2026-03-25T11:20:00.000Z",
        "Facility Ops",
        "Maintenance team"
      ),
      update(
        "u-fac-3",
        "Closed",
        "Facility reopened",
        "The block was inspected, cleaned, and reopened for public use.",
        "2026-03-26T14:50:00.000Z",
        "Facility Ops",
        "Maintenance team"
      ),
    ],
  }),
  buildDemoReport({
    trackingNumber: "EKI-20260323-N4C8T1",
    kind: "report",
    category: "Environment",
    severity: "routine",
    status: "Rejected",
    title: "Repeated smoke alert already merged into active corridor case",
    description:
      "A duplicate smoke complaint from the same corridor was submitted after an earlier report was already under review.",
    lga: "Ado Ekiti",
    community: "Ado-Ekiti",
    ward: "ADO 'C' ODO ADO",
    area: "Odo Ado corridor",
    landmark: "Near the market bridge",
    createdAt: "2026-03-23T10:25:00.000Z",
    updatedAt: "2026-03-23T13:05:00.000Z",
    civicPoints: 0,
    rewardStatus: "not_eligible",
    verificationLabel: "Duplicate report",
    contact: {
      name: "Citizen Reporter",
      phone: "0800 000 0000",
    },
    coordinates: {
      lat: 7.6048,
      lng: 5.2411,
    },
    updates: [
      update(
        "u-env-1",
        "Received",
        "Report received",
        "The smoke alert was logged and checked against similar public reports in the same corridor.",
        "2026-03-23T10:25:00.000Z",
        "EkiSignal Intake",
        "Citizen platform"
      ),
      update(
        "u-env-2",
        "Under Review",
        "Duplicate screening completed",
        "The moderation desk found an older active ticket covering the same issue and location.",
        "2026-03-23T11:10:00.000Z",
        "Moderation Desk",
        "Moderator"
      ),
      update(
        "u-env-3",
        "Rejected",
        "Merged into an existing active case",
        "This submission was closed from the public queue as a duplicate so that updates stay concentrated under one active tracking number.",
        "2026-03-23T13:05:00.000Z",
        "Moderation Desk",
        "Moderator"
      ),
    ],
  }),
]

export const publicNotices: PublicNotice[] = [
  {
    id: "notice-1",
    title: "Drain clearing exercise in Ado-Ekiti continues tonight",
    body: "Environmental health teams will continue night clearing along major market corridors after peak traffic.",
    area: "Ado-Ekiti",
    createdAt: "2026-03-28T08:10:00.000Z",
    tone: "default",
    office: "Environmental Health Response Desk",
    category: "Sanitation",
    impactLabel: "Night operation scheduled",
  },
  {
    id: "notice-2",
    title: "Water pressure restoration ongoing in Ikere",
    body: "Temporary disruptions may continue through the evening while repairs are completed.",
    area: "Ikere",
    createdAt: "2026-03-28T06:40:00.000Z",
    tone: "warning",
    office: "Ikere Water Board Queue",
    category: "Water",
    impactLabel: "Field repair active",
  },
  {
    id: "notice-3",
    title: "Resolved school access issue shared with local PTA network",
    body: "A newly fixed access gate at a public school has been reopened and monitoring continues.",
    area: "Oye",
    createdAt: "2026-03-27T11:30:00.000Z",
    tone: "success",
    office: "Education Monitoring Desk",
    category: "Education",
    impactLabel: "Verified resolution",
  },
  {
    id: "notice-4",
    title: "Road shoulder repair starts along Ijero market link",
    body: "Works crews have marked sections for patching and traffic marshals will guide vehicles during daytime repairs.",
    area: "Ijero",
    createdAt: "2026-03-27T15:20:00.000Z",
    tone: "default",
    office: "Works and Roads Field Team",
    category: "Road",
    impactLabel: "Traffic control in place",
  },
]

export const demoNotifications: AppNotification[] = [
  {
    id: "notification-1",
    title: "Ticket EKI-20260327-W8K2L4 moved to In Progress",
    body: "Ikere Water Board Queue updated your report with an active field response.",
    kind: "status",
    createdAt: "2026-03-28T06:30:00.000Z",
    read: false,
  },
  {
    id: "notification-2",
    title: "Ado-Ekiti area notice published",
    body: "Drain clearing activity has been scheduled around the market corridor tonight.",
    kind: "notice",
    createdAt: "2026-03-28T08:10:00.000Z",
    read: false,
  },
  {
    id: "notification-3",
    title: "Ticket EKI-20260324-F2P5R7 closed",
    body: "The public facility complaint at Oja Bisi has been marked closed after repair verification.",
    kind: "status",
    createdAt: "2026-03-26T14:50:00.000Z",
    read: true,
  },
  {
    id: "notification-4",
    title: "Leadership badge review completed for one verified report",
    body: "A verified public-facility complaint is now in line for leadership badge recognition after field confirmation.",
    kind: "reward",
    createdAt: "2026-03-27T16:10:00.000Z",
    read: false,
  },
  {
    id: "notification-5",
    title: "March impact summary published",
    body: "This month 142 verified reports were supported across Ekiti State, with new leadership badges issued after moderation.",
    kind: "impact",
    createdAt: "2026-03-28T07:45:00.000Z",
    read: true,
  },
]

export const faqs = [
  {
    id: "faq-1",
    question: "Do I need an account before I can report?",
    answer:
      "No. The citizen flow supports quick reporting with contact details only, and the account surface is prepared for later Supabase auth onboarding.",
  },
  {
    id: "faq-2",
    question: "Can I track a report later?",
    answer:
      "Yes. Every submission gets an immediate tracking number, timeline, and assigned office or queue when that information is public-safe.",
  },
  {
    id: "faq-3",
    question: "What happens if location access is denied?",
    answer:
      "The app still works. Citizens can choose Ekiti State, local government, town or community, ward, area, and landmark manually, then place a pin later if needed.",
  },
  {
    id: "faq-4",
    question: "How are abusive reports handled?",
    answer:
      "Moderation rules can flag suspicious or abusive submissions for review before they reach operational handlers, with a clear audit trail for every action.",
  },
]

export const platformTrustMetrics: TrustMetric[] = [
  {
    id: "trust-1",
    label: "Resolved this month",
    value: "126",
    detail: "Citizen-visible cases formally closed with public-safe updates.",
  },
  {
    id: "trust-2",
    label: "Average first review",
    value: "11h",
    detail: "Measured across verified submissions routed through moderation.",
  },
  {
    id: "trust-3",
    label: "Verified reports",
    value: "82%",
    detail: "Reports with clear evidence or location detail after moderation.",
  },
]

export const civicProfile: CivicProfile = {
  fullName: "EkiSignal citizen profile",
  areaLabel: "Ado-Ekiti, Ekiti State",
  memberSince: "2026-01-18T09:00:00.000Z",
  trustTier: "Community verifier",
  civicScore: 186,
  nextTierScore: 240,
  verifiedReports: 6,
  reportsSubmitted: 8,
  reportsResolved: 4,
  rewardsEarned: "3 leadership badges",
  rewardEligibleCount: 2,
  impactSummary: "Your verified reports have contributed to four visible service fixes, two active escalations, and three leadership recognitions.",
}

export const civicRewardHistory: CivicRewardEntry[] = [
  {
    id: "reward-1",
    title: "Market facility repair confirmed",
    reportTrackingNumber: "EKI-20260324-F2P5R7",
    points: 24,
    state: "rewarded",
    createdAt: "2026-03-27T17:30:00.000Z",
    note: "Leadership badge awarded after closure was confirmed by moderation and field photos.",
    amountLabel: "Public Facility Steward",
  },
  {
    id: "reward-2",
    title: "Ikere burst-pipe evidence qualified",
    reportTrackingNumber: "EKI-20260327-W8K2L4",
    points: 34,
    state: "eligible",
    createdAt: "2026-03-28T07:10:00.000Z",
    note: "Evidence was marked clear and location details were verified. Badge review now waits for resolution confirmation.",
    amountLabel: "Leadership review pending",
  },
  {
    id: "reward-3",
    title: "Duplicate smoke alert",
    reportTrackingNumber: "EKI-20260323-N4C8T1",
    points: 0,
    state: "not_eligible",
    createdAt: "2026-03-23T13:05:00.000Z",
    note: "Duplicate submissions do not earn civic points or leadership badge qualification.",
  },
]

export const civicScoreRules = [
  {
    id: "score-1",
    title: "Valid report accepted",
    pointsLabel: "+10 to +18 points",
    body: "A report earns points only after moderation confirms that it is genuine and within scope.",
  },
  {
    id: "score-2",
    title: "Clear evidence attached",
    pointsLabel: "+6 to +12 points",
    body: "Helpful photos, strong descriptions, and accurate location details improve verification quality.",
  },
  {
    id: "score-3",
    title: "Resolution follow-up",
    pointsLabel: "+4 to +8 points",
    body: "Citizens can earn extra score when they confirm that an issue was truly fixed after field action.",
  },
] as const

export const civicScoreWarnings = [
  "Duplicate reports do not qualify for points.",
  "Abusive, fake, or manipulated submissions earn nothing.",
  "Leadership badge review never starts before moderation and verification.",
] as const

export const donationTiers = [
  {
    id: "tier-supporter",
    title: "Community Supporter",
    amountLabel: "NGN 5,000",
    body: "Helps cover moderation shifts and keeps verified reports moving instead of sitting unattended.",
    impactLabel: "Supports one review cycle",
  },
  {
    id: "tier-trust",
    title: "Trust Builder",
    amountLabel: "NGN 25,000",
    body: "Supports moderation, storage, and public update hygiene for verified citizen participation.",
    impactLabel: "Backs verified participation and routing",
  },
  {
    id: "tier-impact",
    title: "Impact Partner",
    amountLabel: "NGN 100,000",
    body: "Strengthens verification, recognition programs, and the monthly transparency summaries that keep the platform credible.",
    impactLabel: "Supports leadership badges and public transparency",
  },
] as const

export const donationImpactStats = [
  {
    id: "impact-1",
    label: "Verified reports supported",
    value: "142",
    detail: "Reports with moderation clearance and traceable follow-up this month.",
  },
  {
    id: "impact-2",
    label: "Leadership badges issued",
    value: "34",
    detail: "Issued only after verification, duplicate screening, and moderation review.",
  },
  {
    id: "impact-3",
    label: "Moderation coverage",
    value: "17 desks",
    detail: "LGA and statewide queues supported through the current transparency cycle.",
  },
] as const

export const reportingSteps: ProcessStep[] = [
  {
    id: "step-1",
    title: "Report clearly",
    body: "Choose the issue type, confirm the category, and add a title, description, and proof from your phone.",
  },
  {
    id: "step-2",
    title: "We route it",
    body: "The system checks category, LGA, ward, and office rules before it enters the right queue or moderation desk.",
  },
  {
    id: "step-3",
    title: "Offices update progress",
    body: "Every assignment, escalation, and public-safe note becomes part of the visible tracking timeline.",
  },
  {
    id: "step-4",
    title: "Verified reports build leadership badges",
    body: "Clear, genuine submissions can improve civic score and qualify for leadership badge recognition after moderation and resolution checks.",
  },
]

export const transparencySnapshots: TransparencySnapshot[] = [
  {
    id: "snapshot-mar",
    month: "March 2026",
    totalDonations: "NGN 4.8m",
    rewardsDisbursed: "18 badges issued",
    citizensRewarded: 34,
    verifiedReportsSupported: 142,
    moderationCoverage: "17 LGA desks and statewide review coverage",
    publishedAt: "2026-03-28T07:40:00.000Z",
  },
  {
    id: "snapshot-feb",
    month: "February 2026",
    totalDonations: "NGN 3.9m",
    rewardsDisbursed: "12 badges issued",
    citizensRewarded: 26,
    verifiedReportsSupported: 118,
    moderationCoverage: "12 LGA desks and central moderation coverage",
    publishedAt: "2026-02-28T16:30:00.000Z",
  },
]

export const transparencyTotals = {
  totalDonationsReceived: "NGN 12.4m",
  totalRewardsPaidOut: "60 badges issued",
  totalVerifiedReportsSupported: "260",
  totalCitizensRewarded: "60",
} as const

export const anonymizedRewardPayouts = [
  {
    id: "payout-1",
    recipientLabel: "Citizen A-14",
    area: "Ado-Ekiti",
    amountLabel: "Public Facility Steward",
    reason: "Verified public facility repair report and closure confirmation.",
    createdAt: "2026-03-27T17:30:00.000Z",
  },
  {
    id: "payout-2",
    recipientLabel: "Citizen I-08",
    area: "Ikere",
    amountLabel: "Water Response Leader",
    reason: "Evidence-rich water disruption report that passed field verification.",
    createdAt: "2026-03-22T16:15:00.000Z",
  },
  {
    id: "payout-3",
    recipientLabel: "Citizen O-03",
    area: "Oye",
    amountLabel: "Community Education Advocate",
    reason: "Resolved education suggestion with confirmed community follow-up.",
    createdAt: "2026-03-12T14:05:00.000Z",
  },
] as const

export const transparencyImpactCards = [
  {
    id: "ledger-impact-1",
    title: "Privacy-first reporting",
    body: "Recognition summaries remain anonymized so the public sees system integrity without seeing personal identity.",
  },
  {
    id: "ledger-impact-2",
    title: "Anti-fraud checks",
    body: "Leadership badge review includes duplicate screening, media checks, and moderation approval before recognition is published.",
  },
  {
    id: "ledger-impact-3",
    title: "Monthly proof of work",
    body: "Each cycle can publish a summary showing donations received, verified reports supported, and leadership badges issued.",
  },
] as const

export const transparencyLedger: TransparencyEntry[] = [
  {
    id: "ledger-1",
    title: "Leadership badge round published",
    amountLabel: "5 badges",
    body: "Five citizens were recognized after field resolution confirmation and duplicate screening.",
    createdAt: "2026-03-26T18:10:00.000Z",
  },
  {
    id: "ledger-2",
    title: "Moderation and storage operations covered",
    amountLabel: "NGN 210,000",
    body: "Donor support covered media storage, moderation shifts, and weekly transparency reporting.",
    createdAt: "2026-03-20T12:00:00.000Z",
  },
  {
    id: "ledger-3",
    title: "Recognition program support replenished",
    amountLabel: "NGN 600,000",
    body: "A fresh donor contribution was added to support the next recognition and moderation cycle.",
    createdAt: "2026-03-18T10:20:00.000Z",
  },
]
