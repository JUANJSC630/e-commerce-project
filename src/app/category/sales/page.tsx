// app/category/sales/page.tsx
"use client"

import { ProductCard } from "@/components/product/product-card"
import { getSaleProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

// Comentario: Página para mostrar productos en oferta.
export default function SalesPage() {
  // Comentario: Obtenemos los productos que están marcados como en oferta.
  const saleProducts: Product[] = getSaleProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        {/* Texto de UI en Español */}
        <h1 className="text-4xl font-montserrat font-bold text-brand-charcoal">¡Ofertas Especiales!</h1>
        <p className="text-lg text-brand-taupe mt-2">No te pierdas estos increíbles descuentos en prendas adorables.</p>
      </header>

      {saleProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {/* Comentario: Renderizamos los productos en oferta. */}
          {saleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // Texto de UI en Español
        <p className="text-center text-brand-taupe">No hay artículos en oferta en este momento. ¡Vuelve más tarde!</p>
      )}
    </div>
  )
}
