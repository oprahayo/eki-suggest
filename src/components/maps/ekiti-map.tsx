"use client"

import { useEffect, useMemo, useState } from "react"
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet"
import { divIcon, type LatLngExpression } from "leaflet"
import { LocateFixed } from "lucide-react"

import { formatLagosTimestamp } from "@/lib/dates"
import { ekitiBounds, ekitiCenter, ekitiOutline } from "@/lib/ekiti"
import { cn } from "@/lib/utils"
import type { ReportCoordinates, ReportRecord } from "@/lib/types"

const EMPTY_TILE_URL =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="#eef3ee"/><path d="M0 128h256M128 0v256" stroke="#dce5de" stroke-width="1"/><circle cx="128" cy="128" r="2" fill="#c5d0c8"/></svg>`
  )

function FlyToSelection({
  center,
  zoom,
}: {
  center: LatLngExpression
  zoom: number
}) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(center, zoom, {
      animate: true,
      duration: 0.75,
    })
  }, [center, map, zoom])

  return null
}

function ClickCapture({
  onSelectCoordinates,
}: {
  onSelectCoordinates?: (coordinates: ReportCoordinates) => void
}) {
  useMapEvents({
    click(event) {
      onSelectCoordinates?.({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      })
    },
  })

  return null
}

function markerColor(report: ReportRecord) {
  if (report.severity === "critical") {
    return "#b84232"
  }

  if (report.status === "In Progress" || report.severity === "urgent") {
    return "#d28c16"
  }

  if (report.status === "Assigned") {
    return "#2378d4"
  }

  if (report.status === "Resolved") {
    return "#0f8b67"
  }

  if (report.status === "Closed" || report.status === "Rejected") {
    return "#7f8782"
  }

  if (report.status === "Received" || report.status === "Under Review") {
    return "#d3a63a"
  }

  return "#0f5c43"
}

function pinIcon() {
  return divIcon({
    className: "ekisignal-pin-icon",
    html: `
      <span style="
        display:grid;
        place-items:center;
        width:26px;
        height:26px;
        border-radius:999px;
        background:#ffffff;
        box-shadow:0 10px 24px rgba(9,31,22,0.25);
        border:2px solid rgba(15,92,67,0.18);
      ">
        <span style="
          width:12px;
          height:12px;
          border-radius:999px;
          background:#0f5c43;
        "></span>
      </span>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

function reportSignalIcon(report: ReportRecord, isActive = false) {
  const color = markerColor(report)
  const ring = isActive
    ? "box-shadow:0 0 0 8px rgba(255,255,255,0.55),0 20px 44px rgba(8,28,20,0.32);transform:scale(1.1);"
    : report.severity === "critical"
      ? "box-shadow:0 0 0 6px rgba(184,66,50,0.16),0 14px 28px rgba(90,18,12,0.3);"
      : "box-shadow:0 12px 26px rgba(8,28,20,0.26),0 0 0 4px rgba(255,255,255,0.18);"

  return divIcon({
    className: "ekisignal-report-marker-shell",
    html: `
      <span class="ekisignal-report-marker" style="display:grid;place-items:center;background:${color};color:${color};${ring}">
        <span style="display:block;width:8px;height:8px;border-radius:999px;background:white;"></span>
      </span>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

function locationDotIcon() {
  return divIcon({
    className: "ekisignal-location-dot-marker",
    html: `
      <span class="ekisignal-location-dot">
        <span class="ekisignal-location-dot-core"></span>
      </span>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

export function EkitiMap({
  reports,
  className,
  selectedCoordinates,
  centerCoordinates,
  userCoordinates,
  activeReportId,
  onReportSelect,
  onSelectCoordinates,
}: {
  reports: ReportRecord[]
  className?: string
  selectedCoordinates?: ReportCoordinates
  centerCoordinates?: ReportCoordinates | null
  userCoordinates?: ReportCoordinates | null
  activeReportId?: string | null
  onReportSelect?: (report: ReportRecord) => void
  onSelectCoordinates?: (coordinates: ReportCoordinates) => void
}) {
  const [tilesReady, setTilesReady] = useState(false)
  const [tileErrorCount, setTileErrorCount] = useState(0)
  const center = selectedCoordinates ?? centerCoordinates ?? userCoordinates ?? ekitiCenter
  const mapBanner = useMemo(() => {
    if (tileErrorCount < 24) {
      return null
    }

    return "Map detail is adapting to the current network. Public report markers are still available."
  }, [tileErrorCount])

  return (
    <div className={cn("relative h-full min-h-[22rem] overflow-hidden rounded-[2rem]", className)}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={10}
        scrollWheelZoom={false}
        className="h-full w-full"
        zoomControl={false}
        maxBounds={[
          [ekitiBounds.southWest.lat, ekitiBounds.southWest.lng],
          [ekitiBounds.northEast.lat, ekitiBounds.northEast.lng],
        ]}
        maxBoundsViscosity={1}
        minZoom={9}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          errorTileUrl={EMPTY_TILE_URL}
          eventHandlers={{
            load: () => setTilesReady(true),
            tileerror: () => {
              setTileErrorCount((current) => current + 1)
              setTilesReady(true)
            },
          }}
        />
        <ZoomControl position="bottomright" />
        <FlyToSelection
          center={[center.lat, center.lng]}
          zoom={
            selectedCoordinates
              ? 16
              : activeReportId && centerCoordinates
                ? 15
                : centerCoordinates || userCoordinates
                  ? 13
                  : 11
          }
        />
        <ClickCapture onSelectCoordinates={onSelectCoordinates} />

        <Polygon
          positions={ekitiOutline.map((point) => [point.lat, point.lng])}
          pathOptions={{
            color: "#115d45",
            weight: 2,
            opacity: 0.7,
            fillColor: "#115d45",
            fillOpacity: 0.04,
          }}
        />

        {reports
          .filter((report) => report.location.coordinates)
          .map((report) => (
            <Marker
              key={report.id}
              position={[
                report.location.coordinates!.lat,
                report.location.coordinates!.lng,
              ]}
              icon={reportSignalIcon(report, activeReportId === report.id)}
              eventHandlers={
                onReportSelect
                  ? {
                      click: () => {
                        onReportSelect(report)
                      },
                    }
                  : undefined
              }
            >
              {!onReportSelect ? (
                <Popup>
                  <div className="space-y-1.5">
                    <p className="font-semibold">{report.title}</p>
                    <p className="text-xs text-slate-600">
                      {report.category} • {report.status}
                    </p>
                    <p className="line-clamp-2 text-xs text-slate-600">{report.description}</p>
                    <p className="text-xs text-slate-500">
                      {[report.location.area || report.location.community, report.location.lga]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-xs text-slate-500">
                      Submitted {formatLagosTimestamp(report.createdAt)}
                    </p>
                  </div>
                </Popup>
              ) : null}
            </Marker>
          ))}

        {selectedCoordinates ? (
          <Marker
            position={[selectedCoordinates.lat, selectedCoordinates.lng]}
            icon={pinIcon()}
          >
            <Popup>Selected report location</Popup>
          </Marker>
        ) : null}

        {userCoordinates ? (
          <Marker
            position={[userCoordinates.lat, userCoordinates.lng]}
            icon={locationDotIcon()}
          >
            <Popup>Your saved device location</Popup>
          </Marker>
        ) : null}
      </MapContainer>

      {!tilesReady ? (
        <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(244,247,242,0.78),rgba(231,238,232,0.58))]">
          <div className="absolute inset-x-4 top-28 rounded-[1.35rem] border border-white/65 bg-white/84 px-4 py-3 text-sm font-medium text-foreground shadow-[0_16px_38px_-28px_rgba(9,31,22,0.38)] backdrop-blur-xl">
            Loading public signal map...
          </div>
        </div>
      ) : null}

      {mapBanner ? (
        <div className="pointer-events-none absolute inset-x-4 top-28 z-20 rounded-[1.35rem] border border-white/65 bg-white/84 px-4 py-3 text-sm font-medium text-foreground shadow-[0_16px_38px_-28px_rgba(9,31,22,0.38)] backdrop-blur-xl md:inset-x-auto md:right-4 md:max-w-sm">
          {mapBanner}
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/24 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-primary/34 via-transparent to-transparent" />
      {userCoordinates ? (
        <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/60 bg-white/82 px-3 py-2 text-xs font-semibold text-foreground shadow-[0_18px_42px_-28px_rgba(9,31,22,0.34)] backdrop-blur-2xl">
          <LocateFixed className="size-3.5" />
          Saved live location
        </div>
      ) : null}
    </div>
  )
}
