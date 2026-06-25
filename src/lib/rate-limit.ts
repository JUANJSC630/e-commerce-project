import "server-only"

import { prisma } from "@/lib/prisma"

/**
 * Database-backed sliding-window rate limiter. Works on serverless (no Redis):
 * each attempt is a row, and a window is "how many rows for this action+identifier
 * since now − windowMs". Old rows are pruned opportunistically on every record so
 * the table stays small without a separate cron.
 *
 * Both primitives are best-effort: if the database is unreachable they fail open
 * (allow the request) rather than locking everyone out - rate limiting must never
 * become a denial of service itself.
 */
export interface RateLimitWindow {
  action: string
  identifier: string
  max: number
  windowMs: number
}

/** True when this action+identifier has reached its limit within the window. */
export async function isRateLimited({
  action,
  identifier,
  max,
  windowMs,
}: RateLimitWindow): Promise<boolean> {
  const since = new Date(Date.now() - windowMs)
  try {
    const recent = await prisma.rateLimitHit.count({
      where: { action, identifier, createdAt: { gte: since } },
    })
    return recent >= max
  } catch (err) {
    console.error("Rate limit check failed; allowing request", { action, err })
    return false
  }
}

/** Records one hit and prunes expired rows for the action (non-blocking). */
export async function recordRateLimitHit(
  action: string,
  identifier: string,
  windowMs: number,
): Promise<void> {
  try {
    await prisma.rateLimitHit.create({ data: { action, identifier } })
    await prisma.rateLimitHit.deleteMany({
      where: { action, createdAt: { lt: new Date(Date.now() - windowMs) } },
    })
  } catch (err) {
    console.error("Rate limit record failed", { action, err })
  }
}

/** Extracts the client IP from proxy headers, falling back to a stable sentinel. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]!.trim()
  return headers.get("x-real-ip")?.trim() || "unknown"
}
