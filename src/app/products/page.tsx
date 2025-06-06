// app/products/page.tsx
"use client"; // Necesario si planeamos añadir interactividad como filtros en el futuro.

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { allMockProducts } from "@/lib/mock-data"; // Importamos todos los productos
import type { Product } from "@/lib/types";

// Comentario: Esta es la página que muestra todos los productos disponibles.
export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate an API call with setTimeout
    setIsLoading(true);
    setError(null);

    // Simulate fetching data with a slight delay to demonstrate the loading state
    const fetchData = async () => {
      try {
        // In a real app, this would be an actual API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setProducts(allMockProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          "No pudimos cargar los productos. Por favor, inténtalo de nuevo más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        {/* Texto de UI en Español */}
        <h1 className="text-4xl font-montserrat font-bold text-brand-charcoal">
          Todos Nuestros Productos
        </h1>
        <p className="text-lg text-brand-taupe mt-2">
          Explora el catálogo completo de prendas adorables para bebés, niñas y
          niños.
        </p>
      </header>

      {/* Estado de carga */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-coral"></div>
          <span className="ml-3 text-brand-taupe">Cargando productos...</span>
        </div>
      )}

      {/* Estado de error */}
      {error && !isLoading && (
        <div className="text-center py-10">
          <div className="text-red-500 mb-3 text-xl">⚠️</div>
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-brand-coral text-white rounded-md hover:bg-brand-coral/90 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {/* Lista de productos (solo se muestra cuando no hay carga ni errores) */}
      {!isLoading && !error && (
        <>
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
              No hay productos disponibles en este momento. Por favor, ¡vuelve
              pronto!
            </p>
          )}
        </>
      )}

      {/* Comentario: En el futuro, aquí se podrían añadir controles de filtrado, ordenamiento y paginación. */}
    </div>
  );
}
