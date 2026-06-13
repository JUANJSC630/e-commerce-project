import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { canManageMedia } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { listUploadedImages } from "@/lib/media-library"
import { MEDIA_SCAN_TAG, deleteMediaFiles, keysInUse } from "@/lib/media-manager"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!canManageMedia(perms)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    return NextResponse.json({ items: await listUploadedImages() })
  } catch (err) {
    console.error("[media] Failed to list uploaded images", err)
    return NextResponse.json({ error: "No se pudo cargar la biblioteca" }, { status: 502 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!canManageMedia(perms)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: { keys?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  const keys = Array.isArray(body.keys)
    ? body.keys.filter((k): k is string => typeof k === "string")
    : []
  if (keys.length === 0) return NextResponse.json({ error: "Sin archivos" }, { status: 400 })

  // Last-moment guard: never delete a file an entity still points at, even if the
  // (cached) scan the client acted on showed it as an orphan.
  const stillUsed = await keysInUse(keys)
  const deletable = keys.filter((k) => !stillUsed.has(k))

  try {
    await deleteMediaFiles(deletable)
  } catch (err) {
    console.error("[media] Failed to delete files", deletable, err)
    return NextResponse.json({ error: "No se pudieron eliminar los archivos" }, { status: 502 })
  }

  revalidateTag(MEDIA_SCAN_TAG)
  return NextResponse.json({ deleted: deletable.length, skipped: [...stillUsed] })
}
