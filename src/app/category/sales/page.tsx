import type { Metadata } from "next"
import { SalesPageComponent } from "@/components/category/sales-page"
import { categories } from "@/config/store.config"
import { getSaleProducts } from "@/lib/mock-data"

const config = categories.find((c) => c.slug === "sales")!

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
  openGraph: {
    title: config.metaTitle,
    description: config.metaDescription,
    type: "website",
  },
}

export default function SalesPage() {
  const products = getSaleProducts()
  return (
    <SalesPageComponent
      products={products}
      title={config.title}
      description={config.description}
      emptyMessage={config.emptyMessage}
    />
  )
}
