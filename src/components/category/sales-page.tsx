import { ProductCard } from "@/components/product/product-card"
import { BreadcrumbNav } from "@/components/layout/breadcrumbs"
import { loadAllSettings } from "@/lib/settings"
import { PRODUCT_GRID_CLASS } from "@/lib/theme"
import { routes } from "@/config/store.config"
import type { Product } from "@/lib/types"

interface SalesPageProps {
  products: Product[]
  title: string
  description: string
  emptyMessage?: string
}

export async function SalesPageComponent({
  products,
  title,
  description,
  emptyMessage,
}: SalesPageProps) {
  const { theme } = await loadAllSettings()
  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav segments={[{ label: "Inicio", href: routes.home }, { label: title }]} />

      <header className="mb-8">
        <h1 className="text-4xl font-display font-bold text-brand-ink">{title}</h1>
        <p className="text-lg text-brand-muted mt-2">{description}</p>
      </header>

      {products.length > 0 ? (
        <div className={`grid ${PRODUCT_GRID_CLASS[theme.cardSize]} gap-4 md:gap-6`}>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        <p className="text-center text-brand-muted py-16">
          {emptyMessage ?? "No hay artículos en oferta en este momento. ¡Vuelve más tarde!"}
        </p>
      )}
    </div>
  )
}
