import type { Metadata } from "next"
import { SalesPageComponent } from "@/components/category/sales-page"
import { categories } from "@/config/store.config"
import { getSaleProducts } from "@/lib/products"

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

export default async function SalesPage() {
  const products = await getSaleProducts()
  return (
    <SalesPageComponent
      products={products}
      title={config.title}
      description={config.description}
      emptyMessage={config.emptyMessage}
    />
  )
}
