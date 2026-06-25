"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import { BreadcrumbNav } from "@/components/layout/breadcrumbs"
import { useSettings } from "@/components/providers/settings-provider"
import { PRODUCT_GRID_CLASS } from "@/lib/theme"
import { routes } from "@/config/store.config"
import type { Product } from "@/lib/types"

interface SearchResultsProps {
  query: string
  results: Product[]
}

export function SearchResults({ query, results }: SearchResultsProps) {
  const { theme } = useSettings()
  const router = useRouter()
  const [inputValue, setInputValue] = useState(query)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = inputValue.trim()
    if (!q) return
    router.push(`${routes.search}?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav segments={[{ label: "Inicio", href: routes.home }, { label: "Buscar" }]} />

      {/* Search input */}
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Buscar productos"
        className="mb-8 max-w-xl"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-border bg-brand-surface focus-within:border-brand-base transition-colors">
          <Search className="h-5 w-5 text-brand-muted shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Buscar prendas, categorías…"
            aria-label="Buscar productos"
            className="flex-1 bg-transparent text-brand-ink placeholder:text-brand-muted text-base outline-none"
          />
          <button
            type="submit"
            className="text-sm font-medium text-brand-base hover:underline transition-colors"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Results heading */}
      {query ? (
        <header className="mb-6">
          <h1 className="text-2xl font-display font-bold text-brand-ink">
            {results.length > 0 ? (
              <>
                {results.length} resultado{results.length !== 1 && "s"} para &ldquo;{query}&rdquo;
              </>
            ) : (
              <>Sin resultados para &ldquo;{query}&rdquo;</>
            )}
          </h1>
          {results.length === 0 && (
            <p className="text-brand-muted mt-2">
              Intenta con otras palabras, como el nombre de la prenda o la categoría.
            </p>
          )}
        </header>
      ) : (
        <header className="mb-6">
          <h1 className="text-2xl font-display font-bold text-brand-ink">¿Qué estás buscando?</h1>
          <p className="text-brand-muted mt-2">
            Escribe el nombre de una prenda, categoría o descripción.
          </p>
        </header>
      )}

      {results.length > 0 && (
        <section aria-label="Resultados de búsqueda">
          <div className={`grid ${PRODUCT_GRID_CLASS[theme.cardSize]} gap-4 md:gap-6`}>
            {results.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
