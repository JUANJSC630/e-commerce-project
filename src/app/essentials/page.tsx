"use client"

import * as React from "react"
import { ProductCard } from "@/components/product/product-card"
import { getEssentialProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/types"
import { essentialsConfig } from "@/config/store.config"

export default function EssentialsPage(): React.ReactElement {
  const [essentialProducts, setEssentialProducts] = React.useState<Product[]>([])
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    try {
      setEssentialProducts(getEssentialProducts())
    } catch (err) {
      console.error("Error fetching essential products:", err)
      setError("No se pudieron cargar los productos esenciales")
    }
  }, [])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-display font-bold text-brand-ink">{essentialsConfig.title}</h1>
        <p className="text-lg text-destructive mt-4">{error}</p>
      </div>
    )
  }

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
