"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutGrid, ChevronDown, ArrowRight } from "lucide-react"
import { routes } from "@/config/store.config"
import type { Category } from "@/lib/categories"

/**
 * "Categorías" trigger that opens a full-width mega-menu of product categories.
 * Each category leads with its photo (photography-first), so browsing feels like
 * flipping through the rack rather than reading a list. Click-to-toggle (works on
 * touch), closes on outside-click, Escape, or navigation.
 */
export function CategoryMegaMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("mousedown", onClick)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("mousedown", onClick)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex items-center gap-2 h-11 px-3 -ml-3 rounded-lg text-sm font-semibold transition-colors ${
          open ? "text-brand-base" : "text-brand-ink hover:text-brand-base"
        }`}
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        Categorías
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <>
          {/* Full-bleed panel anchored under the header */}
          <div className="absolute left-0 top-full z-50 mt-px w-screen max-w-[min(56rem,calc(100vw-2rem))]">
            <div className="rounded-2xl border border-brand-muted/20 bg-brand-surface shadow-xl shadow-brand-ink/5 overflow-hidden">
              {categories.length === 0 ? (
                <p className="p-6 text-sm text-brand-muted">Aún no hay categorías.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`${routes.categoryBase}/${cat.slug}`}
                      className="group flex items-center gap-3 rounded-xl p-2 hover:bg-brand-surface-alt transition-colors"
                    >
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-surface-alt">
                        <Image
                          src={cat.image || "/placeholder.svg"}
                          alt={cat.imageAlt || cat.name}
                          fill
                          sizes="56px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-brand-ink leading-tight group-hover:text-brand-base transition-colors">
                          {cat.name}
                        </span>
                        {cat.description && (
                          <span className="block text-xs text-brand-muted line-clamp-1 mt-0.5">
                            {cat.description}
                          </span>
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              <div className="border-t border-brand-muted/15 px-4 py-3">
                <Link
                  href={routes.products}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-base hover:gap-2.5 transition-all"
                >
                  Ver todos los productos
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
