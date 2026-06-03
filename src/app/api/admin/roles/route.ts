import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "roles", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const roles = await prisma.role.findMany({ orderBy: { createdAt: "asc" } })
  return NextResponse.json(roles)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "roles", "create"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { name, slug, description, permissions } = await request.json()

  if (!name || !slug) {
    return NextResponse.json({ error: "Nombre y slug son requeridos" }, { status: 400 })
  }

  const existing = await prisma.role.findFirst({ where: { OR: [{ name }, { slug }] } })
  if (existing) return NextResponse.json({ error: "Nombre o slug ya existe" }, { status: 409 })

  const role = await prisma.role.create({
    data: { name, slug, description, permissions: permissions ?? {}, isSystem: false },
  })
  return NextResponse.json(role, { status: 201 })
}
