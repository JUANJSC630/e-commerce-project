import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { CategoryError, createCategory, getAdminCategories } from "@/lib/categories"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "categories", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json(await getAdminCategories())
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "categories", "create"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const category = await createCategory(await request.json())
    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    if (err instanceof CategoryError)
      return NextResponse.json({ error: err.message }, { status: err.status })
    return NextResponse.json({ error: "Error al crear la categoría" }, { status: 500 })
  }
}
