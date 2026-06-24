import type {
  OfficeRecord,
  ReportCategory,
  ReportLocation,
  ReportSeverity,
  RoutingDecision,
  RoutingRule,
} from "@/lib/types"

export const offices: OfficeRecord[] = [
  {
    id: "works-ado",
    name: "Ado Works Department Queue",
    type: "department",
    description: "Road rehabilitation, drainage repairs, and right-of-way issues in Ado-Ekiti.",
    email: "works.ado@ekisignal.demo",
    coverage: ["Ado Ekiti"],
    categories: ["Road", "Drainage"],
  },
  {
    id: "water-ikere",
    name: "Ikere Water Board Queue",
    type: "agency",
    description: "Water supply failures, leaks, and borehole breakdowns in Ikere.",
    email: "water.ikere@ekisignal.demo",
    coverage: ["Ikere"],
    categories: ["Water"],
  },
  {
    id: "environment-state",
    name: "Environmental Health Response Desk",
    type: "department",
    description: "Sanitation, waste build-up, open drains, and environmental hazards across Ekiti.",
    email: "environment@ekisignal.demo",
    coverage: ["Statewide"],
    categories: ["Sanitation", "Environment", "Drainage"],
  },
  {
    id: "power-state",
    name: "State Power Response Desk",
    type: "agency",
    description: "Outages, broken transformers, and public lighting failures.",
    email: "power@ekisignal.demo",
    coverage: ["Statewide"],
    categories: ["Electricity"],
  },
  {
    id: "health-state",
    name: "Emergency Health Desk",
    type: "department",
    description: "Primary health centre complaints, ambulance access, and urgent public health reports.",
    email: "health@ekisignal.demo",
    coverage: ["Statewide"],
    categories: ["Health"],
  },
  {
    id: "security-state",
    name: "Public Safety Coordination Centre",
    type: "agency",
    description: "Security incidents, risk alerts, and escalations requiring coordinated response.",
    email: "security@ekisignal.demo",
    coverage: ["Statewide"],
    categories: ["Security"],
  },
  {
    id: "education-state",
    name: "Education Monitoring Desk",
    type: "ministry",
    description: "School conditions, teacher absenteeism, classroom safety, and education service issues.",
    email: "education@ekisignal.demo",
    coverage: ["Statewide"],
    categories: ["Education"],
  },
  {
    id: "facilities-state",
    name: "Public Facility Maintenance Unit",
    type: "department",
    description: "Government buildings, markets, bus parks, street furniture, and civic asset faults.",
    email: "facilities@ekisignal.demo",
    coverage: ["Statewide"],
    categories: ["Public Facility"],
  },
  {
    id: "integrity-state",
    name: "Integrity and Moderation Queue",
    type: "moderation",
    description: "Sensitive complaints, misconduct cases, abusive submissions, and moderation holds.",
    email: "integrity@ekisignal.demo",
    coverage: ["Statewide"],
    categories: ["Corruption / Service Delay", "Other"],
  },
  {
    id: "citizen-default",
    name: "Citizen Relations Default Queue",
    type: "default-queue",
    description: "Fallback queue for uncategorized, suggestion-driven, or manually rerouted submissions.",
    email: "citizen.relations@ekisignal.demo",
    coverage: ["Statewide"],
    categories: [
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
    ],
  },
]

export const routingRules: RoutingRule[] = [
  {
    id: "ado-road",
    label: "Road issues in Ado-Ekiti route to the works queue",
    priority: 100,
    category: "Road",
    lga: "Ado Ekiti",
    officeId: "works-ado",
  },
  {
    id: "ado-drainage",
    label: "Drainage issues in Ado-Ekiti route to the works queue",
    priority: 95,
    category: "Drainage",
    lga: "Ado Ekiti",
    officeId: "works-ado",
  },
  {
    id: "ikere-water",
    label: "Water issues in Ikere route to the Ikere water board queue",
    priority: 100,
    category: "Water",
    lga: "Ikere",
    officeId: "water-ikere",
  },
  {
    id: "sanitation-all",
    label: "Sanitation issues route to the environmental health desk",
    priority: 80,
    category: "Sanitation",
    officeId: "environment-state",
  },
  {
    id: "environment-all",
    label: "Environmental issues route to the environmental health desk",
    priority: 80,
    category: "Environment",
    officeId: "environment-state",
  },
  {
    id: "electricity-all",
    label: "Electricity issues route to the power desk",
    priority: 80,
    category: "Electricity",
    officeId: "power-state",
  },
  {
    id: "health-all",
    label: "Health issues route to the emergency health desk",
    priority: 85,
    category: "Health",
    officeId: "health-state",
  },
  {
    id: "security-all",
    label: "Security issues route to the public safety centre",
    priority: 90,
    category: "Security",
    officeId: "security-state",
  },
  {
    id: "education-all",
    label: "Education issues route to the education monitoring desk",
    priority: 70,
    category: "Education",
    officeId: "education-state",
  },
  {
    id: "facility-all",
    label: "Public facility issues route to the maintenance unit",
    priority: 70,
    category: "Public Facility",
    officeId: "facilities-state",
  },
  {
    id: "integrity-all",
    label: "Corruption and service-delay issues route to the integrity queue",
    priority: 88,
    category: "Corruption / Service Delay",
    officeId: "integrity-state",
  },
  {
    id: "fallback-default",
    label: "Fallback queue for unmatched reports",
    priority: 0,
    officeId: "citizen-default",
    fallback: true,
  },
]

export function getOfficeById(id: string) {
  return offices.find((office) => office.id === id) ?? offices[offices.length - 1]
}

function scoreRule(
  rule: RoutingRule,
  category: ReportCategory,
  location: Pick<ReportLocation, "lga" | "ward">
) {
  let score = rule.priority

  if (rule.category && rule.category !== category) {
    return -1
  }

  if (rule.lga) {
    if (rule.lga !== location.lga) {
      return -1
    }
    score += 25
  }

  if (rule.ward) {
    if (rule.ward !== location.ward) {
      return -1
    }
    score += 10
  }

  return score
}

export function resolveRoutingDecision(input: {
  category: ReportCategory
  location: Pick<ReportLocation, "lga" | "ward">
}): RoutingDecision {
  const rankedRules = routingRules
    .map((rule) => ({
      rule,
      score: scoreRule(rule, input.category, input.location),
    }))
    .filter((entry) => entry.score >= 0)
    .sort((left, right) => right.score - left.score)

  const matchedRule =
    rankedRules[0]?.rule ??
    routingRules.find((rule) => rule.fallback) ??
    routingRules[routingRules.length - 1]

  return {
    office: getOfficeById(matchedRule.officeId),
    rule: matchedRule,
  }
}

export function getEstimatedResponse(severity: ReportSeverity) {
  if (severity === "critical") {
    return "Estimated first review in 2 hours"
  }

  if (severity === "urgent") {
    return "Estimated first review in 12 hours"
  }

  return "Estimated first review in 48 hours"
}
