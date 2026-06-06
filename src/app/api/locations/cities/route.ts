import { NextResponse } from "next/server"
import { searchCities } from "@/lib/locations"

const CACHE = "public, max-age=86400, stale-while-revalidate=604800"
const MAX_LIMIT = 50

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get("country")
  if (!country) {
    return NextResponse.json({ error: "Parámetro 'country' requerido" }, { status: 400 })
  }

  const state = searchParams.get("state") || undefined
  const query = searchParams.get("q") ?? ""
  const limit = Math.min(Number(searchParams.get("limit")) || 20, MAX_LIMIT)

  return NextResponse.json(searchCities(country, state, query, limit), {
    headers: { "Cache-Control": CACHE },
  })
}
