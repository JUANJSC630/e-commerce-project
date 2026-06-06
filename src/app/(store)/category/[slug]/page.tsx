import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryPage } from "@/components/category/category-page"
import { getActiveCategorySlugs, getCategoryBySlug } from "@/lib/categories"
import { getProductsByCategoryId } from "@/lib/products"
import { brand } from "@/config/store.config"

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
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: `Categoría no encontrada — ${brand.name}` }

  const title = category.metaTitle ?? `${category.name} — ${brand.name}`
  const description = category.metaDescription ?? category.description ?? brand.tagline
  return { title, description, openGraph: { title, description, type: "website" } }
}

export default async function CategoryBySlugPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const products = await getProductsByCategoryId(category.id)

  return (
    <CategoryPage
      products={products}
      slug={category.slug}
      title={category.name}
      description={category.description ?? ""}
    />
  )
}
