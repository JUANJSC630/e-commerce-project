import "server-only"

import type { Prisma } from "@prisma/client"

/**
 * Whitelist of product columns an admin form may write. Everything else
 * (id, timestamps, rating/reviewCount, relations) is server-owned, so we never
 * spread the raw request body into Prisma — that would be mass-assignment.
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
  "description",
  "isOnSale",
  "isNew",
  "isFeatured",
  "isPublished",
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
 * else. The cover (`image`) is handled separately — these are only the extras.
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
