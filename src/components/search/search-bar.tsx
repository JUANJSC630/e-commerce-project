"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { routes } from "@/config/store.config"

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`${routes.search}?q=${encodeURIComponent(q)}`)
    setIsOpen(false)
    setQuery("")
  }

  function handleClose() {
    setIsOpen(false)
    setQuery("")
  }

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir buscador"
        className="p-2 rounded-md text-brand-ink hover:bg-brand-surface-alt transition-colors"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Search overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} aria-hidden="true" />

          {/* Search box */}
          <div className="relative w-full max-w-xl bg-brand-surface rounded-2xl shadow-2xl border border-border overflow-hidden">
            <form onSubmit={handleSubmit} role="search" aria-label="Buscar productos">
              <div className="flex items-center gap-3 px-4 py-3">
                <Search className="h-5 w-5 text-brand-muted shrink-0" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar prendas, categorías…"
                  aria-label="Buscar productos"
                  className="flex-1 bg-transparent text-brand-ink placeholder:text-brand-muted text-base outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpiar búsqueda"
                    className="p-1 rounded-md text-brand-muted hover:text-brand-ink transition-colors"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <button type="submit" className="sr-only">
                Buscar
              </button>
            </form>

            <p
              className={cn(
                "text-xs text-brand-muted px-4 pb-3 transition-opacity",
                query ? "opacity-100" : "opacity-0",
              )}
            >
              Presiona Enter para buscar &ldquo;{query}&rdquo;
            </p>
          </div>
        </div>
      )}
    </>
  )
}
