import "server-only"

import { unstable_cache, revalidateTag } from "next/cache"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { specialNavItems } from "@/config/store.config"
import { deleteReplacedImage, deleteUploadedImages } from "@/lib/media-cleanup"
import { parseRules } from "@/lib/collection-rules"
import { revalidateProducts } from "@/lib/products"

/**
 * Category data-access layer. Categories are admin-managed (DB), so the
 * storefront, nav, product form and SEO all read from here. Active-category
 * reads are cached under the `categories` tag; the admin calls
 * `revalidateCategories()` after a change so the nav updates immediately.
 */

export const CATEGORIES_TAG = "categories"

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  imageAlt: string | null
  metaTitle: string | null
  metaDescription: string | null
  parentId: string | null
  /** Smart-collection rules (null = manual category). */
  rules: Prisma.JsonValue | null
}

/** A category with its (recursively nested) active subcategories. */
export interface CategoryNode extends Category {
  children: CategoryNode[]
}

const SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  imageAlt: true,
  metaTitle: true,
  metaDescription: true,
  parentId: true,
  rules: true,
} satisfies Prisma.CategorySelect

const ORDER = [
  { order: "asc" },
  { name: "asc" },
] satisfies Prisma.CategoryOrderByWithRelationInput[]

/** Active categories for the nav and listings - cached + tag-revalidated. */
export const getActiveCategories = unstable_cache(
  (): Promise<Category[]> =>
    prisma.category.findMany({ where: { isActive: true }, orderBy: ORDER, select: SELECT }),
  ["active-categories"],
  { tags: [CATEGORIES_TAG] },
)

/** Active slugs for generateStaticParams. */
export const getActiveCategorySlugs = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    return rows.map((r) => r.slug)
  },
  ["active-category-slugs"],
  { tags: [CATEGORIES_TAG] },
)

export function getCategoryBySlug(slug: string): Promise<Category | null> {
  return prisma.category.findFirst({ where: { slug, isActive: true }, select: SELECT })
}

/** Builds the nested tree (preserving order) from a flat list of categories. */
function buildTree(flat: Category[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>(flat.map((c) => [c.id, { ...c, children: [] }]))
  const roots: CategoryNode[] = []
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  return roots
}

/** Active categories as a nested tree (top-level → subcategories) for the nav. */
export const getCategoryTree = unstable_cache(
  async (): Promise<CategoryNode[]> => buildTree(await getActiveCategories()),
  ["active-category-tree"],
  { tags: [CATEGORIES_TAG] },
)

export interface NavItem {
  label: string
  href: string
}

/** Storefront nav: active categories (admin-managed) followed by special views. */
export async function getNavItems(): Promise<NavItem[]> {
  const categories = await getActiveCategories()
  return [
    ...categories
      .filter((c) => c.parentId === null)
      .map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    ...specialNavItems,
  ]
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export class CategoryError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message)
    this.name = "CategoryError"
  }
}

export interface AdminCategory extends Category {
  order: number
  isActive: boolean
  productCount: number
}

export interface CategoryInput {
  name: string
  slug: string
  description?: string | null
  image?: string | null
  imageAlt?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  order?: number
  isActive?: boolean
  parentId?: string | null
  /** Smart-collection rules; cleaned via parseRules (invalid → null = manual). */
  rules?: unknown
}

/** Normalizes a string into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** All categories (incl. inactive) with product counts - admin list. */
export async function getAdminCategories(): Promise<AdminCategory[]> {
  const rows = await prisma.category.findMany({
    orderBy: ORDER,
    select: { ...SELECT, order: true, isActive: true, _count: { select: { products: true } } },
  })
  return rows.map(({ _count, ...c }) => ({ ...c, productCount: _count.products }))
}

export function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    select: { ...SELECT, order: true, isActive: true },
  })
}

/** Light list for the parent-category selector in the admin form. */
export function getCategoryOptions(): Promise<{ id: string; name: string }[]> {
  return prisma.category.findMany({ orderBy: ORDER, select: { id: true, name: true } })
}

function normalize(input: CategoryInput) {
  const name = input.name?.trim()
  const slug = slugify(input.slug || input.name || "")
  if (!name) throw new CategoryError("El nombre es requerido")
  if (!slug) throw new CategoryError("El slug es requerido")
  return {
    name,
    slug,
    description: input.description?.trim() || null,
    image: input.image?.trim() || null,
    imageAlt: input.imageAlt?.trim() || null,
    metaTitle: input.metaTitle?.trim() || null,
    metaDescription: input.metaDescription?.trim() || null,
    order: Number.isFinite(input.order) ? Number(input.order) : 0,
    isActive: input.isActive ?? true,
    parentId: input.parentId?.trim() || null,
    // Store cleaned rules (or DbNull) so a smart collection never persists junk.
    rules: parseRules(input.rules)
      ? (parseRules(input.rules) as unknown as Prisma.InputJsonValue)
      : Prisma.DbNull,
  }
}

/** Walks up the parent chain to reject cycles when re-parenting a category. */
async function assertNoCycle(id: string, parentId: string | null): Promise<void> {
  if (!parentId) return
  if (parentId === id) throw new CategoryError("Una categoría no puede ser su propia padre")
  let current: string | null = parentId
  while (current) {
    if (current === id) throw new CategoryError("No puedes mover una categoría dentro de sí misma")
    const parent: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: current },
      select: { parentId: true },
    })
    current = parent?.parentId ?? null
  }
}

export async function createCategory(input: CategoryInput): Promise<{ id: string }> {
  try {
    const category = await prisma.category.create({ data: normalize(input), select: { id: true } })
    revalidateCategories()
    revalidateProducts() // smart-collection listings depend on product reads
    return category
  } catch (err) {
    throw toCategoryError(err)
  }
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  try {
    const prev = await prisma.category.findUnique({ where: { id }, select: { image: true } })
    const data = normalize(input)
    await assertNoCycle(id, data.parentId)
    await prisma.category.update({ where: { id }, data })
    await deleteReplacedImage(prev?.image, data.image)
    revalidateCategories()
    revalidateProducts()
  } catch (err) {
    throw toCategoryError(err)
  }
}

/** Deleting a category leaves its products uncategorized (FK is SET NULL). */
export async function deleteCategory(id: string): Promise<void> {
  const removed = await prisma.category.delete({
    where: { id },
    select: { image: true },
  })
  await deleteUploadedImages([removed.image])
  revalidateCategories()
}

function toCategoryError(err: unknown): Error {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return new CategoryError("Ya existe una categoría con ese slug", 409)
  }
  return err instanceof Error ? err : new CategoryError("Error al guardar la categoría", 500)
}

/** Busts the cached active-category reads (nav, sitemap, static params). */
export function revalidateCategories() {
  revalidateTag(CATEGORIES_TAG)
}
