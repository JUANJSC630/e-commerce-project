"use client"

import { SalesPageComponent } from "@/components/category/sales-page"
import { categories } from "@/config/store.config"

const config = categories.find((c) => c.slug === "sales")!

export default function SalesPage() {
  return (
    <SalesPageComponent
      title={config.title}
      description={config.description}
      emptyMessage={config.emptyMessage}
    />
  )
}
