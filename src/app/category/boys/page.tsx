"use client"

import { CategoryPage } from "@/components/category/category-page"
import { categories } from "@/config/store.config"

const config = categories.find((c) => c.slug === "boys")!

export default function BoysCategoryPage() {
  return (
    <CategoryPage
      category={config.key}
      title={config.title}
      description={config.description}
      emptyMessage={config.emptyMessage}
    />
  )
}
