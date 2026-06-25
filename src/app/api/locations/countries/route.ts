import { NextResponse } from "next/server"
import { getCountries } from "@/lib/locations"

// Reference data - render once and cache hard.
export const dynamic = "force-static"

export function GET() {
  return NextResponse.json(getCountries(), {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  })
}
