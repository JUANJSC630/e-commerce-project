import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Prisma } from "@prisma/client"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { pickDiscountInput } from "@/lib/discounts"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "discounts", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" }, take: 200 })
  return NextResponse.json(discounts)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "discounts", "create"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const data = pickDiscountInput(await request.json())
  if (!data.code) {
    return NextResponse.json({ error: "El código es requerido" }, { status: 400 })
  }

  try {
    const discount = await prisma.discount.create({ data })
    return NextResponse.json(discount, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un código con ese nombre" }, { status: 409 })
    }
    throw err
  }
}
