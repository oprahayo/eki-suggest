import { NextResponse } from "next/server"

import {
  EkiSignalBackendError,
  submitCitizenReport,
} from "@/lib/supabase/report-service"

export async function POST(request: Request) {
  // The service-role backend must not accept real citizen records before
  // identity, intake throttling, privacy approval and retention are deployed.
  if (process.env.EKISIGNAL_REAL_INTAKE_ENABLED !== "true") {
    return NextResponse.json(
      { ok: false, error: "Secure live reporting is not yet enabled. This is a demonstration." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
  try {
    const payload = await request.json()
    const result = await submitCitizenReport(payload)

    return NextResponse.json(
      {
        ok: true,
        trackingNumber: result.trackingNumber,
        reportId: result.report.id,
        suggestedDesk: {
          id: result.routing.office.id,
          name: result.routing.office.name,
        },
        deliveryConfirmed: false,
        publicationStatus: "awaiting_moderation",
        routingRule: result.routing.rule
          ? {
              id: result.routing.rule.id,
              code: result.routing.rule.code,
              name: result.routing.rule.name,
            }
          : null,
        isFallback: result.routing.isFallback,
      },
      { status: 201 }
    )
  } catch (error) {
    const message =
      error instanceof EkiSignalBackendError
        ? error.message
        : "Unable to submit the report."

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 400 }
    )
  }
}
