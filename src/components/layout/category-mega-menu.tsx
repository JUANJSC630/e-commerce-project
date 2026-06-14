"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutGrid, ChevronDown, ChevronRight, ArrowRight } from "lucide-react"
import { routes } from "@/config/store.config"
import type { CategoryNode } from "@/lib/categories"

const catHref = (slug: string) => `${routes.categoryBase}/${slug}`

/**
 * "Categorías" mega-menu. A vertical rail of top-level categories on the left;
 * hovering/focusing one reveals its subcategories (and their children) on the
 * right, plus the category photo. The rail scales to many categories without
 * blowing up the panel height — unlike a flat card grid.
 */
export function CategoryMegaMenu({ tree }: { tree: CategoryNode[] }) {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState(tree[0]?.id ?? "")
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

  if (tree.length === 0) {
    return (
      <Link
        href={routes.products}
        className="inline-flex items-center gap-2 h-11 text-sm font-semibold text-brand-ink hover:text-brand-base transition-colors"
      >
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        Categorías
      </Link>
    )
  }

  const active = tree.find((t) => t.id === activeId) ?? tree[0]

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
        <div className="absolute left-0 top-full z-50 mt-px w-[min(64rem,calc(100vw-2rem))]">
          <div className="rounded-2xl border border-brand-muted/20 bg-brand-surface shadow-xl shadow-brand-ink/5 overflow-hidden">
            <div className="flex">
              {/* Rail of top-level categories */}
              <ul
                role="list"
                className="w-56 shrink-0 border-r border-brand-muted/15 py-2 max-h-[70vh] overflow-y-auto"
              >
                {tree.map((cat) => {
                  const isActive = cat.id === active.id
                  return (
                    <li key={cat.id}>
                      <Link
                        href={catHref(cat.slug)}
                        onMouseEnter={() => setActiveId(cat.id)}
                        onFocus={() => setActiveId(cat.id)}
                        className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-brand-surface-alt text-brand-base font-semibold"
                            : "text-brand-ink hover:bg-brand-surface-alt/60 font-medium"
                        }`}
                      >
                        {cat.name}
                        {cat.children.length > 0 && (
                          <ChevronRight
                            className="h-4 w-4 shrink-0 opacity-60"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* Active category panel */}
              <div className="flex-1 min-w-0 flex gap-4 p-5">
                <ActivePanel category={active} />
                {active.image && (
                  <Link
                    href={catHref(active.slug)}
                    className="relative hidden lg:block w-44 shrink-0 self-stretch min-h-[12rem] overflow-hidden rounded-xl bg-brand-surface-alt"
                  >
                    <Image
                      src={active.image}
                      alt={active.imageAlt || active.name}
                      fill
                      sizes="176px"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>
                )}
              </div>
            </div>

            <div className="border-t border-brand-muted/15 px-5 py-3">
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
      )}
    </div>
  )
}

/** Right side of the mega-menu: subcategory columns, or a feature block for a leaf. */
function ActivePanel({ category }: { category: CategoryNode }) {
  if (category.children.length === 0) {
    return (
      <div className="flex-1 min-w-0 max-w-sm">
        <h3 className="text-base font-semibold text-brand-ink">{category.name}</h3>
        {category.description && (
          <p className="mt-1.5 text-sm text-brand-muted leading-relaxed">{category.description}</p>
        )}
        <Link
          href={catHref(category.slug)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-base hover:gap-2.5 transition-all"
        >
          Ver productos
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 content-start">
      {category.children.map((child) => (
        <div key={child.id} className="min-w-0">
          <Link
            href={catHref(child.slug)}
            className="block text-sm font-semibold text-brand-ink hover:text-brand-base transition-colors"
          >
            {child.name}
          </Link>
          {child.children.length > 0 && (
            <ul role="list" className="mt-2 space-y-1.5">
              {child.children.map((grand) => (
                <li key={grand.id}>
                  <Link
                    href={catHref(grand.slug)}
                    className="block text-sm text-brand-muted hover:text-brand-base transition-colors"
                  >
                    {grand.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
