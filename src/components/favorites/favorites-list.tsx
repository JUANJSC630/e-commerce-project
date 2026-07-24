"use client"

import { Heart } from "lucide-react"
import { useAllFavoriteIds } from "@/hooks/use-favorites"
import { BreadcrumbNav } from "@/components/layout/breadcrumbs"
import { FavoritesGrid } from "@/components/favorites/favorites-grid"
import { routes } from "@/config/store.config"

/** Standalone `/favoritos` page: page chrome (breadcrumb + heading) + the grid. */
export function FavoritesList() {
  const count = useAllFavoriteIds().length

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
        {count > 0 && (
          <p className="text-brand-muted mt-1" aria-live="polite">
            {count} prenda{count !== 1 && "s"} guardada{count !== 1 && "s"}
          </p>
        )}
      </header>

      <FavoritesGrid />
    </div>
  )
}
