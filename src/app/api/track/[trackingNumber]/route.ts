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
