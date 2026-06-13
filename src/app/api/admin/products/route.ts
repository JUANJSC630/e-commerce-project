import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { pickProductInput } from "@/lib/product-input"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "create"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()

  if (!body.name || typeof body.price !== "number") {
    return NextResponse.json({ error: "Nombre y precio son requeridos" }, { status: 400 })
  }

  const product = await prisma.product.create({ data: pickProductInput(body) })
  return NextResponse.json(product, { status: 201 })
}
