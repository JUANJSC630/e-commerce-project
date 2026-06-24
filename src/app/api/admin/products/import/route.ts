import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"

interface ProductRow {
  id?: string
  name: string
  price: number
  originalPrice?: number | null
  image?: string
  category: string
  sizes?: string[]
  colors?: string[]
  description?: string | null
  isOnSale?: boolean
  isNew?: boolean
  isFeatured?: boolean
  isPublished?: boolean
  stock?: number
}

function parseBool(val: string | undefined): boolean {
  return val === "true" || val === "1" || val === "yes"
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ",") {
        fields.push(current)
        current = ""
      } else {
        current += ch
      }
    }
  }
  fields.push(current)
  return fields
}

function parseRow(headers: string[], values: string[]): ProductRow | null {
  const get = (key: string) => {
    const idx = headers.indexOf(key)
    return idx >= 0 ? values[idx]?.trim() : undefined
  }

  const name = get("name")
  const priceStr = get("price")
  const category = get("category")

  if (!name || !priceStr || !category) return null

  const price = parseFloat(priceStr)
  if (isNaN(price) || price < 0) return null

  const originalPriceStr = get("originalPrice")
  const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : null
  const stockStr = get("stock")

  return {
    id: get("id") || undefined,
    name,
    price,
    originalPrice: originalPrice && !isNaN(originalPrice) ? originalPrice : null,
    image: get("image") || "/placeholder.svg",
    category,
    sizes: get("sizes")?.split(";").filter(Boolean) ?? [],
    colors: get("colors")?.split(";").filter(Boolean) ?? [],
    description: get("description") || null,
    isOnSale: parseBool(get("isOnSale")),
    isNew: parseBool(get("isNew")),
    isFeatured: parseBool(get("isFeatured")),
    isPublished: get("isPublished") !== undefined ? parseBool(get("isPublished")) : true,
    stock: stockStr ? parseInt(stockStr, 10) || 0 : 0,
  }
}

/**
 * Import products from CSV. If a row has an `id` that matches an existing
 * product, it's updated; otherwise a new product is created.
 * Max 500 rows per request.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "products", "create"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const contentType = request.headers.get("content-type") ?? ""
  let csvText: string

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    const file = form.get("file")
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }
    csvText = await file.text()
  } else {
    csvText = await request.text()
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV must have headers + at least 1 row" }, { status: 400 })
  }
  if (lines.length > 501) {
    return NextResponse.json({ error: "Max 500 rows per import" }, { status: 400 })
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  const rows: ProductRow[] = []
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const row = parseRow(headers, values)
    if (!row) {
      errors.push(`Row ${i + 1}: missing required fields (name, price, category)`)
      continue
    }
    rows.push(row)
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid rows found", errors }, { status: 400 })
  }

  let created = 0
  let updated = 0

  for (const row of rows) {
    const data = {
      name: row.name,
      price: row.price,
      originalPrice: row.originalPrice,
      image: row.image ?? "/placeholder.svg",
      category: row.category,
      sizes: row.sizes ?? [],
      colors: row.colors ?? [],
      description: row.description,
      isOnSale: row.isOnSale ?? false,
      isNew: row.isNew ?? false,
      isFeatured: row.isFeatured ?? false,
      isPublished: row.isPublished ?? true,
      stock: row.stock ?? 0,
    }

    if (row.id) {
      const existing = await prisma.product.findUnique({ where: { id: row.id } })
      if (existing) {
        await prisma.product.update({ where: { id: row.id }, data })
        updated++
      } else {
        await prisma.product.create({ data })
        created++
      }
    } else {
      await prisma.product.create({ data })
      created++
    }
  }

  return NextResponse.json({ created, updated, errors: errors.length > 0 ? errors : undefined })
}
