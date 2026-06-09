import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { hasPermission } from "@/lib/permissions"
import type { Permissions, Resource } from "@/lib/permissions"
import { listUploadedImages } from "@/lib/media-library"

/** Resources whose editors upload images — any grants library access. */
const IMAGE_RESOURCES: Resource[] = ["products", "categories", "settings"]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  const canBrowse = IMAGE_RESOURCES.some(
    (r) => hasPermission(perms, r, "create") || hasPermission(perms, r, "update"),
  )
  if (!canBrowse) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    return NextResponse.json({ items: await listUploadedImages() })
  } catch (err) {
    console.error("[media] Failed to list uploaded images", err)
    return NextResponse.json({ error: "No se pudo cargar la biblioteca" }, { status: 502 })
  }
}
