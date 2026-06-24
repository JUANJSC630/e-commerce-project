import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { pickProductInput, pickGalleryUrls } from "@/lib/product-input"
import { revalidateProducts } from "@/lib/products"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Bounded read: the admin list page queries Prisma directly with pagination,
  // so this endpoint just caps the result instead of dumping the whole table.
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
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

  const gallery = pickGalleryUrls(body) ?? []
  const product = await prisma.product.create({
    data: {
      ...pickProductInput(body),
      images: { create: gallery.map((url, position) => ({ url, position })) },
    },
  })
  revalidateProducts()
  return NextResponse.json(product, { status: 201 })
}
