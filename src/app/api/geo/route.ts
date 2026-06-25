import { NextResponse } from "next/server"

// Per-request, never cached.
export const dynamic = "force-dynamic"

/** First forwarded IP if it's public; otherwise undefined (loopback/private). */
function publicIp(forwardedFor: string | null): string | undefined {
  const first = forwardedFor?.split(",")[0]?.trim()
  if (!first) return undefined
  const isPrivate =
    first === "::1" ||
    first.startsWith("127.") ||
    first.startsWith("10.") ||
    first.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(first)
  return isPrivate ? undefined : first
}

/**
 * Best-effort country detection (ISO-3166 alpha-2). Prefers the edge geo header
 * set by the hosting platform (Vercel/Cloudflare) - zero latency, no API key.
 * Falls back to a keyless geo-IP lookup. Always returns a shape; `country` is
 * null when detection isn't possible, and the client falls back to its default.
 */
export async function GET(request: Request) {
  const headerCountry =
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry")
  if (headerCountry && headerCountry !== "XX") {
    return NextResponse.json({ country: headerCountry.toUpperCase() })
  }

  try {
    const ip = publicIp(request.headers.get("x-forwarded-for"))
    const res = await fetch(`https://ipwho.is/${ip ?? ""}?fields=success,country_code`, {
      signal: AbortSignal.timeout(2500),
    })
    const data = await res.json()
    if (data?.success && typeof data.country_code === "string") {
      return NextResponse.json({ country: data.country_code.toUpperCase() })
    }
  } catch {
    // Network/timeout - fall through to null.
  }

  return NextResponse.json({ country: null })
}
