import type { Metadata } from "next"
import { CategoryPage } from "@/components/category/category-page"
import { categories } from "@/config/store.config"
import { getProductsByCategory } from "@/lib/mock-data"

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

export default function BoysCategoryPage() {
  const products = getProductsByCategory(config.key)
  return (
    <CategoryPage
      products={products}
      title={config.title}
      description={config.description}
      emptyMessage={config.emptyMessage}
    />
  )
}
