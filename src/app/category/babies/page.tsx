// app/category/babies/page.tsx
"use client"

import { ProductCard } from "@/components/product/product-card"
import { getProductsByCategory } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

// Comentario: Esta es la página de categoría para "Bebés".
export default function BabiesCategoryPage() {
  // Comentario: Obtenemos los productos de la categoría "Babies" desde nuestros datos de maqueta.
  const babyProducts: Product[] = getProductsByCategory("Babies") // Lógica interna usa "Babies"

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        {/* Texto de UI en Español */}
        <h1 className="text-4xl font-montserrat font-bold text-brand-charcoal">Colección Bebés</h1>
        <p className="text-lg text-brand-taupe mt-2">Ropa adorable y cómoda para tus pequeños (0-24 meses).</p>
      </header>

      {babyProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {/* Comentario: Mapeamos sobre los productos de bebé y renderizamos una ProductCard para cada uno. */}
          {babyProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // Texto de UI en Español
        <p className="text-center text-brand-taupe">Aún no hay productos en esta categoría. ¡Vuelve pronto!</p>
      )}
      {/* Comentario: Aquí se podrían añadir filtros o paginación en el futuro. */}
    </div>
  )
}
