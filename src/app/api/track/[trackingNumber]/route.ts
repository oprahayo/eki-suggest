import { NextResponse } from "next/server"

import {
  EkiSignalBackendError,
  getPublicReportTracking,
} from "@/lib/supabase/report-service"

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      trackingNumber: string
    }>
  }
) {
  if (process.env.EKISIGNAL_REAL_INTAKE_ENABLED !== "true") {
    return NextResponse.json(
      { ok: false, error: "Live tracking is not enabled. Local example tickets are not server records." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
  try {
    const { trackingNumber } = await context.params
    const data = await getPublicReportTracking(trackingNumber)

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tracking number not found.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      data,
    })
  } catch (error) {
    const message =
      error instanceof EkiSignalBackendError
        ? error.message
        : "Unable to load the public tracking record."

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 400 }
    )
  }
}
