import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { loadAllSettings, saveSetting } from "@/lib/settings"
import { SETTINGS_KEYS } from "@/lib/settings-keys"

const VALID_KEYS = new Set(Object.values(SETTINGS_KEYS))

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "settings", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const settings = await loadAllSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "settings", "update"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: { key: string; value: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const { key, value } = body

  if (!key || !VALID_KEYS.has(key as never)) {
    return NextResponse.json({ error: `Invalid key: ${key}` }, { status: 400 })
  }

  if (value === undefined || value === null) {
    return NextResponse.json({ error: "Value is required" }, { status: 400 })
  }

  const saved = await saveSetting(key, value)
  return NextResponse.json({ success: true, setting: saved })
}
