// app/essentials/page.tsx
"use client"

import { ProductCard } from "@/components/product/product-card"
import { getEssentialProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

// Comentario: Página para mostrar productos esenciales.
export default function EssentialsPage() {
  // Comentario: Obtenemos los productos considerados esenciales.
  const essentialProducts: Product[] = getEssentialProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        {/* Texto de UI en Español */}
        <h1 className="text-4xl font-montserrat font-bold text-brand-charcoal">Esenciales de Cada Día</h1>
        <p className="text-lg text-brand-taupe mt-2">
          Básicos cómodos, duraderos y versátiles para el armario de tu hijo/a.
        </p>
      </header>

      {essentialProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {/* Comentario: Mostramos la lista de productos esenciales. */}
          {essentialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // Texto de UI en Español
        <p className="text-center text-brand-taupe">
          No se encontraron productos esenciales. Por favor, revisa nuestras otras categorías.
        </p>
      )}
    </div>
  )
}
