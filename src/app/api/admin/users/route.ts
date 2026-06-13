import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { PASSWORD_MIN_LENGTH } from "@/lib/account"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "users", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, status: true, createdAt: true, role: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "users", "create"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { email, password, name, roleId } = await request.json()

  if (!email || !password || !roleId) {
    return NextResponse.json({ error: "Email, contraseña y rol son requeridos" }, { status: 400 })
  }
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres` },
      { status: 400 },
    )
  }

  // Validate the role exists up front — a bad roleId would otherwise surface as a
  // 500 from the foreign-key constraint instead of a clean 400.
  const role = await prisma.role.findUnique({ where: { id: roleId }, select: { id: true } })
  if (!role) return NextResponse.json({ error: "El rol indicado no existe" }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 })

  const hashedPassword = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, roleId, status: "ACTIVE" },
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...safeUser } = user
  return NextResponse.json(safeUser, { status: 201 })
}
