import "server-only"

import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { Product } from "@/lib/types"

/**
 * Storefront product data-access layer.
 *
 * Single source of truth for reading the catalog from Postgres. Server
 * Components and the public `/api/products` routes both depend on these
 * functions (never on Prisma directly), so the storefront stays decoupled
 * from the persistence schema — swap the ORM here without touching the UI.
 *
 * Every query is scoped to published products and maps the Prisma row to the
 * lean domain `Product` the UI consumes (dropping admin-only columns).
 */

/** Only published products are ever visible to shoppers. */
const PUBLISHED = { isPublished: true } satisfies Prisma.ProductWhereInput

/** Columns the storefront actually renders — avoids over-fetching admin fields. */
const STOREFRONT_SELECT = {
  id: true,
  name: true,
  price: true,
  originalPrice: true,
  image: true,
  categoryRef: { select: { name: true, slug: true } },
  sizes: true,
  colors: true,
  description: true,
  isOnSale: true,
  isNew: true,
  stock: true,
  rating: true,
  reviewCount: true,
} satisfies Prisma.ProductSelect

type ProductRow = Prisma.ProductGetPayload<{ select: typeof STOREFRONT_SELECT }>

const NEWEST_FIRST = { createdAt: "desc" } satisfies Prisma.ProductOrderByWithRelationInput

/** Maps a Prisma row to the domain model, normalizing `null` → `undefined`. */
function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    image: row.image,
    category: row.categoryRef,
    sizes: row.sizes,
    colors: row.colors,
    stock: row.stock,
    reviewCount: row.reviewCount,
    isOnSale: row.isOnSale,
    isNew: row.isNew,
    originalPrice: row.originalPrice ?? undefined,
    rating: row.rating ?? undefined,
    description: row.description ?? undefined,
  }
}

/** Runs a published-scoped query and maps the result to domain products. */
async function queryProducts(args: Omit<Prisma.ProductFindManyArgs, "select">): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    ...args,
    where: { ...PUBLISHED, ...args.where },
    select: STOREFRONT_SELECT,
  })
  return rows.map(toProduct)
}

export function getAllProducts(): Promise<Product[]> {
  return queryProducts({ orderBy: NEWEST_FIRST })
}

export function getProductsByCategory(slug: string): Promise<Product[]> {
  return queryProducts({ where: { categoryRef: { slug } }, orderBy: NEWEST_FIRST })
}

export function getProductsByCategoryId(categoryId: string): Promise<Product[]> {
  return queryProducts({ where: { categoryId }, orderBy: NEWEST_FIRST })
}

export function getSaleProducts(): Promise<Product[]> {
  return queryProducts({ where: { isOnSale: true }, orderBy: NEWEST_FIRST })
}

export function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return queryProducts({ where: { isFeatured: true }, orderBy: NEWEST_FIRST, take: limit })
}

export function getRelatedProducts(
  product: Pick<Product, "id" | "category">,
  limit = 4,
): Promise<Product[]> {
  if (!product.category) return Promise.resolve([])
  return queryProducts({
    where: { categoryRef: { slug: product.category.slug }, id: { not: product.id } },
    orderBy: NEWEST_FIRST,
    take: limit,
  })
}

export function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return Promise.resolve([])
  return queryProducts({ where: { id: { in: ids } } })
}

export function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim()
  if (!q) return Promise.resolve([])
  return queryProducts({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { categoryRef: { name: { contains: q, mode: "insensitive" } } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: NEWEST_FIRST,
  })
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await prisma.product.findFirst({
    where: { id, ...PUBLISHED },
    select: STOREFRONT_SELECT,
  })
  return row ? toProduct(row) : null
}

/** Lightweight id-only query for the sitemap. */
export async function getAllProductIds(): Promise<string[]> {
  const rows = await prisma.product.findMany({ where: PUBLISHED, select: { id: true } })
  return rows.map((row) => row.id)
}
