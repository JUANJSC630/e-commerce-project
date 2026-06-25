import type { Prisma } from "@prisma/client"

/**
 * Smart-collection rules: a category can list products matched by conditions
 * instead of a manual assignment. Kept tiny and declarative so each condition
 * maps cleanly to a Prisma filter, and the same rules drive the storefront and
 * the admin preview.
 */

export type CollectionField =
  | "onSale"
  | "new"
  | "featured"
  | "priceMin"
  | "priceMax"
  | "category"
  | "tag"

export interface CollectionCondition {
  field: CollectionField
  /** Boolean for flag fields, number for price, string (slug) for category. */
  value: boolean | number | string
}

export interface CollectionRules {
  /** "all" → every condition (AND); "any" → at least one (OR). */
  match: "all" | "any"
  conditions: CollectionCondition[]
}

/** Type guard + normalizer for a value read from the DB `rules` JSON column. */
export function parseRules(value: unknown): CollectionRules | null {
  if (!value || typeof value !== "object") return null
  const obj = value as Record<string, unknown>
  if (!Array.isArray(obj.conditions)) return null
  const conditions = obj.conditions.filter(
    (c): c is CollectionCondition =>
      !!c && typeof c === "object" && typeof (c as CollectionCondition).field === "string",
  )
  if (conditions.length === 0) return null
  return { match: obj.match === "any" ? "any" : "all", conditions }
}

/** True when the category should list by rules rather than manual assignment. */
export function hasRules(value: unknown): boolean {
  return parseRules(value) !== null
}

/** Maps a single condition to a Prisma Product filter (ignored if malformed). */
function conditionToWhere(c: CollectionCondition): Prisma.ProductWhereInput | null {
  switch (c.field) {
    case "onSale":
      return { isOnSale: c.value !== false }
    case "new":
      return { isNew: c.value !== false }
    case "featured":
      return { isFeatured: c.value !== false }
    case "priceMin":
      return typeof c.value === "number" ? { price: { gte: c.value } } : null
    case "priceMax":
      return typeof c.value === "number" ? { price: { lte: c.value } } : null
    case "category":
      return typeof c.value === "string" && c.value ? { categoryRef: { slug: c.value } } : null
    case "tag":
      return typeof c.value === "string" && c.value ? { tags: { has: c.value } } : null
    default:
      return null
  }
}

/**
 * Builds the Prisma `where` for a smart collection. Empty/invalid rules yield a
 * never-matching filter (`id: ""`) so a misconfigured collection shows nothing
 * rather than the entire catalog.
 */
export function rulesToWhere(rules: CollectionRules): Prisma.ProductWhereInput {
  const filters = rules.conditions
    .map(conditionToWhere)
    .filter((f): f is Prisma.ProductWhereInput => f !== null)
  if (filters.length === 0) return { id: "" }
  return rules.match === "any" ? { OR: filters } : { AND: filters }
}
