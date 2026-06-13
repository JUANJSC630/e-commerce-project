import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "roles", "update"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  // Block privilege self-escalation: a user can't rewrite the permissions of the
  // very role they hold (which would let them grant themselves anything).
  if (id === session.user.role.id && "permissions" in body) {
    return NextResponse.json(
      { error: "No puedes modificar los permisos de tu propio rol" },
      { status: 403 },
    )
  }

  const allowed = ["name", "description", "permissions"]
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  const role = await prisma.role.update({ where: { id }, data })
  return NextResponse.json(role)
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "roles", "delete"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (role.isSystem) {
    return NextResponse.json(
      { error: "Los roles de sistema no se pueden eliminar" },
      { status: 403 },
    )
  }

  // Check if any user has this role
  const usersWithRole = await prisma.user.count({ where: { roleId: id } })
  if (usersWithRole > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: ${usersWithRole} usuario(s) tienen este rol` },
      { status: 409 },
    )
  }

  await prisma.role.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
