"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useAllFavoriteIds } from "@/hooks/use-favorites"
import { ProductCard } from "@/components/product/product-card"
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton"
import { BreadcrumbNav } from "@/components/layout/breadcrumbs"
import { routes } from "@/config/store.config"
import type { Product } from "@/lib/types"

export function FavoritesList() {
  const ids = useAllFavoriteIds()
  const idsKey = ids.join(",")
  // `null` = still loading the catalog for the saved ids.
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([])
      return
    }

    const controller = new AbortController()
    setProducts(null)
    fetch(`/api/products?ids=${encodeURIComponent(idsKey)}`, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<Product[]>) : Promise.reject(res)))
      .then(setProducts)
      .catch((error) => {
        if (!controller.signal.aborted) setProducts([])
        return error
      })

    return () => controller.abort()
    // idsKey is the serialized identity of `ids`; ids.length derives from it.
  }, [idsKey, ids.length])

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav
        segments={[{ label: "Inicio", href: routes.home }, { label: "Mis Favoritos" }]}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-brand-ink flex items-center gap-3">
          <Heart className="h-7 w-7 text-brand-base fill-brand-base" aria-hidden="true" />
          Mis Favoritos
        </h1>
        {products && products.length > 0 && (
          <p className="text-brand-muted mt-1" aria-live="polite">
            {products.length} prenda{products.length !== 1 && "s"} guardada
            {products.length !== 1 && "s"}
          </p>
        )}
      </header>

      {products === null ? (
        <ProductGridSkeleton count={ids.length || 4} />
      ) : products.length > 0 ? (
        <section aria-label="Productos favoritos">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
          <div className="rounded-full bg-brand-surface-alt p-6">
            <Heart className="h-12 w-12 text-brand-muted" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-display font-semibold text-brand-ink">
              Aún no tienes favoritos
            </p>
            <p className="text-brand-muted mt-2 max-w-xs">
              Toca el corazón en cualquier prenda para guardarla aquí.
            </p>
          </div>
          <Link
            href={routes.products}
            className="px-6 py-3 rounded-xl bg-brand-base text-brand-on-base font-semibold hover:opacity-90 transition-opacity"
          >
            Ver catálogo
          </Link>
        </div>
      )}
    </div>
  )
}
