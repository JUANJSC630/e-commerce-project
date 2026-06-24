import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"

const CSV_HEADERS = [
  "id",
  "name",
  "price",
  "originalPrice",
  "image",
  "category",
  "sizes",
  "colors",
  "description",
  "isOnSale",
  "isNew",
  "isFeatured",
  "isPublished",
  "stock",
]

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "read"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      price: true,
      originalPrice: true,
      image: true,
      category: true,
      sizes: true,
      colors: true,
      description: true,
      isOnSale: true,
      isNew: true,
      isFeatured: true,
      isPublished: true,
      stock: true,
    },
  })

  const rows = products.map((p) =>
    [
      p.id,
      escapeCsv(p.name),
      p.price,
      p.originalPrice ?? "",
      escapeCsv(p.image),
      escapeCsv(p.category),
      escapeCsv(p.sizes.join(";")),
      escapeCsv(p.colors.join(";")),
      escapeCsv(p.description),
      p.isOnSale ? "true" : "false",
      p.isNew ? "true" : "false",
      p.isFeatured ? "true" : "false",
      p.isPublished ? "true" : "false",
      p.stock,
    ].join(","),
  )

  const csv = [CSV_HEADERS.join(","), ...rows].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
