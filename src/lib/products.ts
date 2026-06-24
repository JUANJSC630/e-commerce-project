import "server-only"

import { unstable_cache, revalidateTag } from "next/cache"
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
 *
 * Catalog reads are cached under the `products` tag (5-min ISR window); the
 * admin calls `revalidateProducts()` after any mutation so edits appear at once.
 * Identity-variable reads (search, arbitrary id lists) stay uncached on purpose.
 */

export const PRODUCTS_TAG = "products"
const CACHE = { tags: [PRODUCTS_TAG], revalidate: 300 }

/** Only published products are ever visible to shoppers. */
const PUBLISHED = { isPublished: true } satisfies Prisma.ProductWhereInput

/** Columns the storefront actually renders — avoids over-fetching admin fields. */
const STOREFRONT_SELECT = {
  id: true,
  name: true,
  price: true,
  originalPrice: true,
  image: true,
  imageAlt: true,
  categoryRef: { select: { name: true, slug: true } },
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" } },
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
    imageAlt: row.imageAlt ?? undefined,
    images: row.images.map((img) => ({ url: img.url, alt: img.alt ?? undefined })),
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

export const getAllProducts = unstable_cache(
  (): Promise<Product[]> => queryProducts({ orderBy: NEWEST_FIRST }),
  ["all-products"],
  CACHE,
)

export const getProductsByCategory = unstable_cache(
  (slug: string): Promise<Product[]> =>
    queryProducts({ where: { categoryRef: { slug } }, orderBy: NEWEST_FIRST }),
  ["products-by-category"],
  CACHE,
)

export const getProductsByCategoryId = unstable_cache(
  (categoryId: string): Promise<Product[]> =>
    queryProducts({ where: { categoryId }, orderBy: NEWEST_FIRST }),
  ["products-by-category-id"],
  CACHE,
)

export const getSaleProducts = unstable_cache(
  (): Promise<Product[]> => queryProducts({ where: { isOnSale: true }, orderBy: NEWEST_FIRST }),
  ["sale-products"],
  CACHE,
)

export const getFeaturedProducts = unstable_cache(
  (limit = 8): Promise<Product[]> =>
    queryProducts({ where: { isFeatured: true }, orderBy: NEWEST_FIRST, take: limit }),
  ["featured-products"],
  CACHE,
)

const getRelatedBySlug = unstable_cache(
  (slug: string, excludeId: string, limit: number): Promise<Product[]> =>
    queryProducts({
      where: { categoryRef: { slug }, id: { not: excludeId } },
      orderBy: NEWEST_FIRST,
      take: limit,
    }),
  ["related-products"],
  CACHE,
)

export function getRelatedProducts(
  product: Pick<Product, "id" | "category">,
  limit = 4,
): Promise<Product[]> {
  if (!product.category) return Promise.resolve([])
  return getRelatedBySlug(product.category.slug, product.id, limit)
}

export const getProductById = unstable_cache(
  async (id: string): Promise<Product | null> => {
    const row = await prisma.product.findFirst({
      where: { id, ...PUBLISHED },
      select: STOREFRONT_SELECT,
    })
    return row ? toProduct(row) : null
  },
  ["product-by-id"],
  CACHE,
)

/** Lightweight id-only query for the sitemap. */
export const getAllProductIds = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await prisma.product.findMany({ where: PUBLISHED, select: { id: true } })
    return rows.map((row) => row.id)
  },
  ["all-product-ids"],
  CACHE,
)

/** Variable, user-driven reads — not worth caching (would explode the key space). */
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

/** Invalidate every cached catalog read — call after any product mutation. */
export function revalidateProducts(): void {
  revalidateTag(PRODUCTS_TAG)
}
