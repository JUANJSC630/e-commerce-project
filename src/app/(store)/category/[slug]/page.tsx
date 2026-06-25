import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryPage } from "@/components/category/category-page"
import { getActiveCategorySlugs, getCategoryBySlug } from "@/lib/categories"
import { getProductsByCategoryId, getProductsByRules } from "@/lib/products"
import { parseRules } from "@/lib/collection-rules"
import { loadAllSettings } from "@/lib/settings"

// ISR: served statically, refreshed periodically; the admin also revalidates the
// `categories` tag on edits so the nav updates immediately.
export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getActiveCategorySlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [category, { brand }] = await Promise.all([getCategoryBySlug(slug), loadAllSettings()])
  if (!category) return { title: `Categoría no encontrada - ${brand.name}` }

  const title = category.metaTitle ?? `${category.name} - ${brand.name}`
  const description = category.metaDescription ?? category.description ?? brand.tagline
  return { title, description, openGraph: { title, description, type: "website" } }
}

export default async function CategoryBySlugPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  // Smart collection: list by rules; otherwise by manual assignment.
  const rules = parseRules(category.rules)
  const products = rules
    ? await getProductsByRules(rules)
    : await getProductsByCategoryId(category.id)

  return (
    <CategoryPage
      products={products}
      slug={category.slug}
      title={category.name}
      description={category.description ?? ""}
    />
  )
}
