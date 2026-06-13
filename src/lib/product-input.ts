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
