import { NextResponse } from "next/server"
import { getStates } from "@/lib/locations"

const CACHE = "public, max-age=3600, stale-while-revalidate=86400"

export function GET(request: Request) {
  const country = new URL(request.url).searchParams.get("country")
  if (!country) {
    return NextResponse.json({ error: "Parámetro 'country' requerido" }, { status: 400 })
  }
  return NextResponse.json(getStates(country), { headers: { "Cache-Control": CACHE } })
}
