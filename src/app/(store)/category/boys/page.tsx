import type { Metadata } from "next"
import { CategoryPage } from "@/components/category/category-page"
import { categories } from "@/config/store.config"
import { getProductsByCategory } from "@/lib/products"

const config = categories.find((c) => c.slug === "boys")!

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
  openGraph: {
    title: config.metaTitle,
    description: config.metaDescription,
    type: "website",
  },
}

export default async function BoysCategoryPage() {
  const products = await getProductsByCategory(config.key)
  return (
    <CategoryPage
      products={products}
      slug={config.slug}
      title={config.title}
      description={config.description}
      emptyMessage={config.emptyMessage}
    />
  )
}
