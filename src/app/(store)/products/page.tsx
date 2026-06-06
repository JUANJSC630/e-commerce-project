import type { Metadata } from "next"
import { ProductCard } from "@/components/product/product-card"
import { getAllProducts } from "@/lib/products"
import { pageMetadata } from "@/lib/seo"

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("products")
}

export default async function AllProductsPage() {
  const products = await getAllProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-display font-bold text-brand-ink">Todos Nuestros Productos</h1>
        <p className="text-lg text-brand-muted mt-2">
          Explora el catálogo completo de prendas adorables para bebés, niñas y niños.
        </p>
      </header>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-brand-muted">
          No hay productos disponibles en este momento. ¡Vuelve pronto!
        </p>
      )}
    </div>
  )
}
