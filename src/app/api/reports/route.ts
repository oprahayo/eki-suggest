import { NextResponse } from "next/server"

import {
  EkiSignalBackendError,
  submitCitizenReport,
} from "@/lib/supabase/report-service"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const result = await submitCitizenReport(payload)

    return NextResponse.json(
      {
        ok: true,
        trackingNumber: result.trackingNumber,
        reportId: result.report.id,
        assignedOffice: {
          id: result.routing.office.id,
          name: result.routing.office.name,
        },
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
