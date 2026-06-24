import { ekitiCenter } from "@/lib/ekiti"
import type { ReportCoordinates, ReportRecord } from "@/lib/types"

function normalizeSignalLabel(value?: string) {
  return value
    ?.toLowerCase()
    .replace(/,?\s*nigeria$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function hashSeed(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

function offsetFromSeed(seed: string, spread: number) {
  const normalized = (hashSeed(seed) % 2000) / 1000 - 1
  return normalized * spread
}

function averageCoordinates(coordinates: ReportCoordinates[]) {
  if (coordinates.length === 0) {
    return null
  }

  const total = coordinates.reduce(
    (accumulator, current) => ({
      lat: accumulator.lat + current.lat,
      lng: accumulator.lng + current.lng,
    }),
    { lat: 0, lng: 0 }
  )

  return {
    lat: total.lat / coordinates.length,
    lng: total.lng / coordinates.length,
  } satisfies ReportCoordinates
}

function findAnchorCoordinates(report: ReportRecord, reports: ReportRecord[]) {
  const area = normalizeSignalLabel(report.location.area)
  const community = normalizeSignalLabel(report.location.community)
  const lga = normalizeSignalLabel(report.location.lga)

  const exactMatches = reports.filter(
    (candidate) => candidate.id !== report.id && candidate.location.coordinates
  )

  const areaAnchor = averageCoordinates(
    exactMatches
      .filter(
        (candidate) =>
          area &&
          [candidate.location.area, candidate.location.landmark]
            .map((value) => normalizeSignalLabel(value))
            .includes(area)
      )
      .map((candidate) => candidate.location.coordinates!)
  )

  if (areaAnchor) {
    return {
      coordinates: areaAnchor,
      spread: 0.006,
    }
  }

  const communityAnchor = averageCoordinates(
    exactMatches
      .filter(
        (candidate) =>
          community &&
          normalizeSignalLabel(candidate.location.community) === community
      )
      .map((candidate) => candidate.location.coordinates!)
  )

  if (communityAnchor) {
    return {
      coordinates: communityAnchor,
      spread: 0.01,
    }
  }

  const lgaAnchor = averageCoordinates(
    exactMatches
      .filter((candidate) => lga && normalizeSignalLabel(candidate.location.lga) === lga)
      .map((candidate) => candidate.location.coordinates!)
  )

  if (lgaAnchor) {
    return {
      coordinates: lgaAnchor,
      spread: 0.018,
    }
  }

  return {
    coordinates: ekitiCenter,
    spread: 0.085,
  }
}

export function resolvePublicSignalCoordinates(
  report: ReportRecord,
  reports: ReportRecord[]
): ReportCoordinates {
  if (report.location.coordinates) {
    return report.location.coordinates
  }

  const anchor = findAnchorCoordinates(report, reports)
  const seedBase = `${report.trackingNumber}-${report.location.lga}-${report.location.area}`

  return {
    lat: anchor.coordinates.lat + offsetFromSeed(`${seedBase}-lat`, anchor.spread),
    lng: anchor.coordinates.lng + offsetFromSeed(`${seedBase}-lng`, anchor.spread),
  }
}

export function materializePublicSignalReports(reports: ReportRecord[]) {
  const publicReports = reports.filter((report) => report.isPublic)

  return publicReports.map((report) => ({
    ...report,
    location: {
      ...report.location,
      coordinates: resolvePublicSignalCoordinates(report, publicReports),
    },
  }))
}
