"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { routes } from "@/config/store.config"

/**
 * Always-visible search field for the desktop header. Search is a primary task
 * for this audience (a grandparent looking for "body bebé" shouldn't hunt for a
 * magnifier icon), so it lives inline rather than behind a modal. The compact
 * icon-trigger modal still covers small screens.
 */
export function HeaderSearch({ className = "" }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`${routes.search}?q=${encodeURIComponent(q)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Buscar productos"
      className={`group flex items-center gap-2.5 rounded-full bg-brand-surface-alt/60 px-4 h-11 border border-transparent focus-within:border-brand-base/40 focus-within:bg-brand-surface transition-colors ${className}`}
    >
      <Search
        className="h-4 w-4 shrink-0 text-brand-muted group-focus-within:text-brand-base transition-colors"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar prendas, tallas o categorías…"
        aria-label="Buscar productos"
        className="flex-1 min-w-0 bg-transparent text-sm text-brand-ink placeholder:text-brand-muted outline-none"
      />
    </form>
  )
}
