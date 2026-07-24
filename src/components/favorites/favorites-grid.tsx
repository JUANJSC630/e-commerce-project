"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useAllFavoriteIds } from "@/hooks/use-favorites"
import { ProductCard } from "@/components/product/product-card"
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton"
import { useSettings } from "@/components/providers/settings-provider"
import { PRODUCT_GRID_CLASS } from "@/lib/theme"
import { routes } from "@/config/store.config"
import type { Product } from "@/lib/types"

/**
 * Loads and renders the customer's saved favorites (skeleton → grid → empty
 * state). Header-less on purpose so it can drop into both the standalone
 * `/favoritos` page and the account dashboard's Favoritos tab, each supplying
 * its own heading/chrome.
 */
export function FavoritesGrid() {
  const { theme } = useSettings()
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

  if (products === null) return <ProductGridSkeleton count={ids.length || 4} />

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-6">
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
    )
  }

  return (
    <section aria-label="Productos favoritos">
      <div className={`grid ${PRODUCT_GRID_CLASS[theme.cardSize]} gap-4 md:gap-6`}>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 4} />
        ))}
      </div>
    </section>
  )
}
