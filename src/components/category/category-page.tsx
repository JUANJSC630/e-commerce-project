"use client"

import { useState, useMemo } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import { BreadcrumbNav } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { routes } from "@/config/store.config"
import { useSettings } from "@/components/providers/settings-provider"
import { PRODUCT_GRID_CLASS } from "@/lib/theme"
import type { Product } from "@/lib/types"

interface CategoryPageProps {
  products: Product[]
  slug: string
  title: string
  description: string
  emptyMessage?: string
}

interface ActiveFilters {
  sizes: string[]
  colors: string[]
  maxPrice: number | null
}

const INITIAL_FILTERS: ActiveFilters = { sizes: [], colors: [], maxPrice: null }

function useFilters(products: Product[]) {
  const [filters, setFilters] = useState<ActiveFilters>(INITIAL_FILTERS)

  const allSizes = useMemo(() => [...new Set(products.flatMap((p) => p.sizes ?? []))], [products])
  const allColors = useMemo(() => [...new Set(products.flatMap((p) => p.colors ?? []))], [products])
  const maxProductPrice = useMemo(() => Math.max(...products.map((p) => p.price), 0), [products])

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        if (filters.sizes.length > 0 && !filters.sizes.some((s) => p.sizes?.includes(s)))
          return false
        if (filters.colors.length > 0 && !filters.colors.some((c) => p.colors?.includes(c)))
          return false
        if (filters.maxPrice !== null && p.price > filters.maxPrice) return false
        return true
      }),
    [products, filters],
  )

  const activeCount =
    filters.sizes.length + filters.colors.length + (filters.maxPrice !== null ? 1 : 0)

  function toggleSize(size: string) {
    setFilters((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }))
  }

  function toggleColor(color: string) {
    setFilters((f) => ({
      ...f,
      colors: f.colors.includes(color) ? f.colors.filter((c) => c !== color) : [...f.colors, color],
    }))
  }

  function setMaxPrice(value: number | null) {
    setFilters((f) => ({ ...f, maxPrice: value }))
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS)
  }

  return {
    filters,
    filteredProducts,
    allSizes,
    allColors,
    maxProductPrice,
    activeCount,
    toggleSize,
    toggleColor,
    setMaxPrice,
    clearFilters,
  }
}

interface FilterPanelProps {
  allSizes: string[]
  allColors: string[]
  maxProductPrice: number
  filters: ActiveFilters
  onToggleSize: (size: string) => void
  onToggleColor: (color: string) => void
  onSetMaxPrice: (value: number | null) => void
  onClear: () => void
  activeCount: number
}

const PRICE_STEPS = [20000, 30000, 50000, 80000]

function FilterPanel({
  allSizes,
  allColors,
  maxProductPrice,
  filters,
  onToggleSize,
  onToggleColor,
  onSetMaxPrice,
  onClear,
  activeCount,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {activeCount > 0 && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-sm text-brand-base hover:underline self-start"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          Limpiar filtros ({activeCount})
        </button>
      )}

      {maxProductPrice > 0 && (
        <section aria-labelledby="filter-price">
          <h3 id="filter-price" className="text-sm font-semibold text-brand-ink mb-3">
            Precio máximo
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onSetMaxPrice(null)}
              className={cn(
                "text-left text-sm px-3 py-1.5 rounded-lg transition-colors",
                filters.maxPrice === null
                  ? "bg-brand-base text-brand-on-base font-medium"
                  : "text-foreground hover:bg-brand-surface-alt",
              )}
              aria-pressed={filters.maxPrice === null}
            >
              Todos los precios
            </button>
            {PRICE_STEPS.filter((step) => step <= maxProductPrice + 5000).map((step) => (
              <button
                key={step}
                onClick={() => onSetMaxPrice(step)}
                className={cn(
                  "text-left text-sm px-3 py-1.5 rounded-lg transition-colors",
                  filters.maxPrice === step
                    ? "bg-brand-base text-brand-on-base font-medium"
                    : "text-foreground hover:bg-brand-surface-alt",
                )}
                aria-pressed={filters.maxPrice === step}
              >
                Hasta ${step.toLocaleString("es-CO")}
              </button>
            ))}
          </div>
        </section>
      )}

      {allSizes.length > 0 && (
        <section aria-labelledby="filter-sizes">
          <h3 id="filter-sizes" className="text-sm font-semibold text-brand-ink mb-3">
            Talla
          </h3>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="filter-sizes">
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => onToggleSize(size)}
                aria-pressed={filters.sizes.includes(size)}
                className={cn(
                  "px-3 py-1 text-xs rounded-lg border-2 font-medium transition-all",
                  filters.sizes.includes(size)
                    ? "border-brand-base bg-brand-base text-brand-on-base"
                    : "border-border text-foreground hover:border-brand-muted",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </section>
      )}

      {allColors.length > 0 && (
        <section aria-labelledby="filter-colors">
          <h3 id="filter-colors" className="text-sm font-semibold text-brand-ink mb-3">
            Color
          </h3>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="filter-colors">
            {allColors.map((color) => (
              <button
                key={color}
                onClick={() => onToggleColor(color)}
                aria-label={`Filtrar por color ${color}`}
                aria-pressed={filters.colors.includes(color)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  filters.colors.includes(color)
                    ? "border-brand-base scale-110 shadow-md ring-2 ring-brand-base ring-offset-1"
                    : "border-border hover:border-brand-muted",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export function CategoryPage({
  products,
  slug,
  title,
  description,
  emptyMessage,
}: CategoryPageProps) {
  void slug
  const { theme } = useSettings()
  const gridColumns = PRODUCT_GRID_CLASS[theme.cardSize]
  const {
    filters,
    filteredProducts,
    allSizes,
    allColors,
    maxProductPrice,
    activeCount,
    toggleSize,
    toggleColor,
    setMaxPrice,
    clearFilters,
  } = useFilters(products)

  const hasFilters = allSizes.length > 0 || allColors.length > 0

  const filterPanelProps: FilterPanelProps = {
    allSizes,
    allColors,
    maxProductPrice,
    filters,
    onToggleSize: toggleSize,
    onToggleColor: toggleColor,
    onSetMaxPrice: setMaxPrice,
    onClear: clearFilters,
    activeCount,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav segments={[{ label: "Inicio", href: routes.home }, { label: title }]} />

      <header className="mb-8">
        <h1 className="text-4xl font-display font-bold text-brand-ink">{title}</h1>
        <p className="text-lg text-brand-muted mt-2">{description}</p>
      </header>

      <div className="flex gap-8">
        {hasFilters && (
          <aside className="hidden lg:block w-56 shrink-0" aria-label="Filtros de productos">
            <div className="sticky top-24">
              <p className="text-sm font-semibold text-brand-ink mb-4 uppercase tracking-wide">
                Filtrar
              </p>
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>
        )}

        <section className="flex-1 min-w-0" aria-label="Productos">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </p>
            {hasFilters && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                    Filtrar
                    {activeCount > 0 && (
                      <span className="ml-1 bg-brand-base text-brand-on-base text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-72 p-6">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filtrar productos</SheetTitle>
                  </SheetHeader>
                  <FilterPanel {...filterPanelProps} />
                </SheetContent>
              </Sheet>
            )}
          </div>

          {hasFilters && (
            <p className="hidden lg:block text-sm text-muted-foreground mb-6" aria-live="polite">
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </p>
          )}

          {filteredProducts.length > 0 ? (
            <div className={cn("grid gap-4 md:gap-6", gridColumns)}>
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
          ) : (
            <p className="text-center text-brand-muted py-16">
              {activeCount > 0
                ? "Sin resultados para los filtros seleccionados."
                : (emptyMessage ?? "Aún no hay productos en esta categoría. ¡Vuelve pronto!")}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
