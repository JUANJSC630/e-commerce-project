import "server-only"

import type { Prisma } from "@prisma/client"

/**
 * Whitelist of product columns an admin form may write. Everything else
 * (id, timestamps, rating/reviewCount, relations) is server-owned, so we never
 * spread the raw request body into Prisma - that would be mass-assignment.
 */
const EDITABLE_FIELDS = [
  "name",
  "price",
  "originalPrice",
  "image",
  "imageAlt",
  "category",
  "categoryId",
  "sizes",
  "colors",
  "tags",
  "description",
  "isOnSale",
  "isNew",
  "isFeatured",
  "isPublished",
  "isPreorder",
  "stock",
] as const

/** Picks only the editable product fields present in `body`. */
export function pickProductInput(body: unknown): Prisma.ProductUncheckedCreateInput {
  const source = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>
  const data: Record<string, unknown> = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in source) data[field] = source[field]
  }
  return data as Prisma.ProductUncheckedCreateInput
}

/**
 * Parses the gallery field (`body.images`) into an ordered, de-duplicated list of
 * image URLs. Accepts an array of strings or `{ url }` objects; ignores anything
 * else. The cover (`image`) is handled separately - these are only the extras.
 * Returns `null` when `images` is absent, signalling "leave the gallery untouched".
 */
export function pickGalleryUrls(body: unknown): string[] | null {
  const source = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>
  if (!("images" in source)) return null
  const raw = source.images
  if (!Array.isArray(raw)) return []
  const urls: string[] = []
  for (const item of raw) {
    const url = typeof item === "string" ? item : (item as { url?: unknown })?.url
    if (typeof url === "string" && url.trim() && !urls.includes(url)) urls.push(url.trim())
  }
  return urls
}

/** A parsed, ready-to-persist variant row (without the product link or position). */
export interface ParsedVariant {
  size: string | null
  color: string | null
  sku: string | null
  price: number | null
  stock: number
  imageUrl: string | null
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

/**
 * Parses the `body.variants` field into clean variant rows. Drops rows with no
 * size, color or SKU (nothing to identify them). Price is optional (null =
 * inherit the product price); stock defaults to 0 and is clamped non-negative.
 * Returns `null` when `variants` is absent → "leave the variants untouched".
 */
export function pickVariants(body: unknown): ParsedVariant[] | null {
  const source = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>
  if (!("variants" in source)) return null
  const raw = source.variants
  if (!Array.isArray(raw)) return []
  const rows: ParsedVariant[] = []
  for (const item of raw) {
    const v = (item ?? {}) as Record<string, unknown>
    const size = str(v.size)
    const color = str(v.color)
    const sku = str(v.sku)
    if (!size && !color && !sku) continue
    const stock = num(v.stock) ?? 0
    rows.push({
      size,
      color,
      sku,
      price: num(v.price),
      stock: Math.max(0, Math.trunc(stock)),
      imageUrl: str(v.imageUrl),
    })
  }
  return rows
}
