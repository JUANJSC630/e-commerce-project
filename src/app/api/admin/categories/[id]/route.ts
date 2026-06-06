import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { CategoryError, deleteCategory, getCategoryById, updateCategory } from "@/lib/categories"

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "categories", "update"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  try {
    await updateCategory(id, await request.json())
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof CategoryError)
      return NextResponse.json({ error: err.message }, { status: err.status })
    return NextResponse.json({ error: "Error al actualizar la categoría" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "categories", "delete"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await deleteCategory(id)
  return new NextResponse(null, { status: 204 })
}

export async function GET(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "categories", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const category = await getCategoryById(id)
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(category)
}
