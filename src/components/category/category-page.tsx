"use client"

import { ProductCard } from "@/components/product/product-card"
import { getProductsByCategory } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

interface CategoryPageProps {
  category: string
  title: string
  description: string
  emptyMessage?: string
}

export function CategoryPage({ category, title, description, emptyMessage }: CategoryPageProps) {
  // Fetch products for the specified category
  const products: Product[] = getProductsByCategory(category)

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-display font-bold text-brand-ink">{title}</h1>
        <p className="text-lg text-brand-muted mt-2">{description}</p>
      </header>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-brand-muted">{emptyMessage ?? "Aún no hay productos en esta categoría. ¡Vuelve pronto!"}</p>
      )}
      {/* Space for potential future additions like filters or pagination */}
    </div>
  )
}
