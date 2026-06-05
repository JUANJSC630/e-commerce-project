import type { Metadata } from "next"
import { ProductCard } from "@/components/product/product-card"
import { getEssentialProducts } from "@/lib/products"
import { essentialsConfig, pageSeo } from "@/config/store.config"

export const metadata: Metadata = {
  title: pageSeo.essentials.title,
  description: pageSeo.essentials.description,
  openGraph: {
    title: pageSeo.essentials.title,
    description: pageSeo.essentials.description,
    type: "website",
  },
}

export default async function EssentialsPage() {
  const essentialProducts = await getEssentialProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-display font-bold text-brand-ink">{essentialsConfig.title}</h1>
        <p className="text-lg text-brand-muted mt-2">{essentialsConfig.description}</p>
      </header>

      {essentialProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {essentialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-brand-muted">{essentialsConfig.emptyMessage}</p>
      )}
    </div>
  )
}
