import type { Metadata } from "next"
import { SalesPageComponent } from "@/components/category/sales-page"
import { categories } from "@/config/store.config"
import { getSaleProducts } from "@/lib/products"
import { loadAllSettings } from "@/lib/settings"
import { customMetadata } from "@/lib/seo"

const config = categories.find((c) => c.slug === "sales")!

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await loadAllSettings()
  return customMetadata(
    "Ofertas de Ropa Infantil",
    `Aprovecha los mejores descuentos en ropa para bebés, niñas y niños en ${brand.name}. Calidad a precios increíbles.`,
  )
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
