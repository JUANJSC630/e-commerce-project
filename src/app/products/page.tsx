// app/products/page.tsx
"use client" // Necesario si planeamos añadir interactividad como filtros en el futuro.

import { ProductCard } from "@/components/product/product-card"
import { allMockProducts } from "@/lib/mock-data" // Importamos todos los productos
import type { Product } from "@/lib/types"

// Comentario: Esta es la página que muestra todos los productos disponibles.
export default function AllProductsPage() {
  // Comentario: Obtenemos la lista completa de productos desde nuestros datos de maqueta.
  const products: Product[] = allMockProducts

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        {/* Texto de UI en Español */}
        <h1 className="text-4xl font-montserrat font-bold text-brand-charcoal">Todos Nuestros Productos</h1>
        <p className="text-lg text-brand-taupe mt-2">
          Explora el catálogo completo de prendas adorables para bebés, niñas y niños.
        </p>
      </header>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {/* Comentario: Mapeamos sobre todos los productos y renderizamos una ProductCard para cada uno.
              He ajustado la cuadrícula para potencialmente mostrar más productos por fila (xl:grid-cols-5).
              Esto se puede ajustar según la preferencia de diseño. */}
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // Texto de UI en Español
        <p className="text-center text-brand-taupe">
          No hay productos disponibles en este momento. Por favor, ¡vuelve pronto!
        </p>
      )}
      {/* Comentario: En el futuro, aquí se podrían añadir controles de filtrado, ordenamiento y paginación. */}
    </div>
  )
}
