"use client"

import { ProductCard } from "@/components/product/product-card"
import { getSaleProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

interface SalesPageProps {
  title: string
  description: string
}

export function SalesPageComponent({ title, description }: SalesPageProps) {
  // Fetch products that are on sale
  const saleProducts: Product[] = getSaleProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-montserrat font-bold text-brand-charcoal">{title}</h1>
        <p className="text-lg text-brand-taupe mt-2">{description}</p>
      </header>

      {saleProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {saleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-brand-taupe">No hay artículos en oferta en este momento. ¡Vuelve más tarde!</p>
      )}
    </div>
  )
}
