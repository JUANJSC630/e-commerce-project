import "server-only"

import { unstable_cache, revalidateTag } from "next/cache"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { specialNavItems } from "@/config/store.config"
import { deleteReplacedImage, deleteUploadedImages } from "@/lib/media-cleanup"

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
  metaTitle: string | null
  metaDescription: string | null
}

const SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  metaTitle: true,
  metaDescription: true,
} satisfies Prisma.CategorySelect

const ORDER = [
  { order: "asc" },
  { name: "asc" },
] satisfies Prisma.CategoryOrderByWithRelationInput[]

/** Active categories for the nav and listings — cached + tag-revalidated. */
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

export interface NavItem {
  label: string
  href: string
}

/** Storefront nav: active categories (admin-managed) followed by special views. */
export async function getNavItems(): Promise<NavItem[]> {
  const categories = await getActiveCategories()
  return [
    ...categories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
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
  metaTitle?: string | null
  metaDescription?: string | null
  order?: number
  isActive?: boolean
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

/** All categories (incl. inactive) with product counts — admin list. */
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
    metaTitle: input.metaTitle?.trim() || null,
    metaDescription: input.metaDescription?.trim() || null,
    order: Number.isFinite(input.order) ? Number(input.order) : 0,
    isActive: input.isActive ?? true,
  }
}

export async function createCategory(input: CategoryInput): Promise<{ id: string }> {
  try {
    const category = await prisma.category.create({ data: normalize(input), select: { id: true } })
    revalidateCategories()
    return category
  } catch (err) {
    throw toCategoryError(err)
  }
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  try {
    const prev = await prisma.category.findUnique({ where: { id }, select: { image: true } })
    const data = normalize(input)
    await prisma.category.update({ where: { id }, data })
    await deleteReplacedImage(prev?.image, data.image)
    revalidateCategories()
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
