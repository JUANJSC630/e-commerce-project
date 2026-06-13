import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { canManageMedia } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { MEDIA_SCAN_TAG, scanMediaUsage } from "@/lib/media-manager"

/** Forces a fresh media scan (bypasses the 5-minute cache) for the manager UI. */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!canManageMedia(perms)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    revalidateTag(MEDIA_SCAN_TAG)
    return NextResponse.json(await scanMediaUsage())
  } catch (err) {
    console.error("[media] Scan failed", err)
    return NextResponse.json({ error: "No se pudo escanear el CDN" }, { status: 502 })
  }
}
