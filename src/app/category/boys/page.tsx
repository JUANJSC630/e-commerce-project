// app/category/boys/page.tsx
"use client"

import { ProductCard } from "@/components/product/product-card"
import { getProductsByCategory } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

// Comentario: Página de categoría para "Niños".
export default function BoysCategoryPage() {
  // Comentario: Obtenemos los productos de la categoría "Boys".
  const boysProducts: Product[] = getProductsByCategory("Boys") // Lógica interna usa "Boys"

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        {/* Texto de UI en Español */}
        <h1 className="text-4xl font-montserrat font-bold text-brand-charcoal">Colección Niños</h1>
        <p className="text-lg text-brand-taupe mt-2">Ropa genial y cómoda para pequeños aventureros activos.</p>
      </header>

      {boysProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {/* Comentario: Mostramos los productos para niños. */}
          {boysProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // Texto de UI en Español
        <p className="text-center text-brand-taupe">Aún no hay productos en esta categoría. ¡Vuelve pronto!</p>
      )}
    </div>
  )
}
