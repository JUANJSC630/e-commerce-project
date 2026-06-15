import type { Metadata } from "next"
import { CategoryPage } from "@/components/category/category-page"
import { getAllProducts } from "@/lib/products"
import { pageMetadata } from "@/lib/seo"

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("products")
}

export default async function AllProductsPage() {
  const products = await getAllProducts()

  return (
    <CategoryPage
      products={products}
      slug=""
      title="Todos los productos"
      description="Explora el catálogo completo de prendas adorables para bebés, niñas y niños."
      emptyMessage="No hay productos disponibles en este momento. ¡Vuelve pronto!"
    />
  )
}
