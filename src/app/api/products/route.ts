import { NextResponse } from "next/server"
import {
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductsByIds,
  getSaleProducts,
  searchProducts,
} from "@/lib/products"
import type { Product } from "@/lib/types"

/**
 * Public catalog endpoint. Consumed by client components that can't reach the
 * data layer directly (e.g. the favorites page, which only knows ids stored in
 * the browser). Server Components call `@/lib/products` directly instead.
 */
function resolve(params: URLSearchParams): Promise<Product[]> {
  const ids = params.get("ids")
  if (ids !== null) {
    return getProductsByIds(
      ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    )
  }

  const query = params.get("q")
  if (query !== null) return searchProducts(query)

  if (params.has("featured")) {
    const limit = Number(params.get("limit"))
    return getFeaturedProducts(Number.isFinite(limit) && limit > 0 ? limit : undefined)
  }

  if (params.has("sale")) return getSaleProducts()

  const category = params.get("category")
  if (category) return getProductsByCategory(category)

  return getAllProducts()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const products = await resolve(searchParams)
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: "No se pudieron cargar los productos" }, { status: 500 })
  }
}
