import "server-only"

import { unstable_cache } from "next/cache"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { specialNavItems } from "@/config/store.config"

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
