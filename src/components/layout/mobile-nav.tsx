"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, Heart, User, ChevronDown } from "lucide-react"
import { routes } from "@/config/store.config"
import type { NavItem } from "@/config/store.config"
import type { CategoryNode } from "@/lib/categories"

interface MobileNavProps {
  tree: CategoryNode[]
  links: NavItem[]
}

const catHref = (slug: string) => `${routes.categoryBase}/${slug}`

export function MobileNav({ tree, links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const close = () => setIsOpen(false)
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        className="p-2 rounded-md text-brand-ink hover:bg-brand-surface-alt transition-colors"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-brand-ink/50" onClick={close} aria-hidden="true" />

          <nav
            id="mobile-nav-drawer"
            aria-label="Navegación móvil"
            className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-brand-surface shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-brand-muted/30">
              <span className="font-display font-bold text-xl text-brand-ink">Menú</span>
              <button
                onClick={close}
                aria-label="Cerrar menú"
                className="p-2 rounded-md text-brand-ink hover:bg-brand-surface-alt transition-colors"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-brand-muted/20">
              <Link
                href={routes.search}
                onClick={close}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-surface-alt text-brand-muted hover:text-brand-base transition-colors"
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="text-sm">Buscar productos…</span>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {links.length > 0 && (
                <ul className="py-2" role="list">
                  {links.map((link) => (
                    <li key={`${link.label}-${link.href}`}>
                      <Link
                        href={link.href}
                        onClick={close}
                        className="flex items-center px-6 py-3 text-brand-ink hover:bg-brand-surface-alt hover:text-brand-base transition-colors text-base font-semibold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {tree.length > 0 && (
                <div className="border-t border-brand-muted/15 pt-2">
                  <p className="px-6 pt-2 pb-1 text-xs font-semibold uppercase tracking-widest text-brand-muted">
                    Categorías
                  </p>
                  <ul role="list">
                    {tree.map((cat) => (
                      <li key={cat.id}>
                        <div className="flex items-center">
                          <Link
                            href={catHref(cat.slug)}
                            onClick={close}
                            className="flex-1 px-6 py-2.5 text-brand-ink hover:text-brand-base transition-colors text-base"
                          >
                            {cat.name}
                          </Link>
                          {cat.children.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggle(cat.id)}
                              aria-expanded={expanded.has(cat.id)}
                              aria-label={`Mostrar subcategorías de ${cat.name}`}
                              className="p-2 mr-3 text-brand-muted hover:text-brand-base"
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${expanded.has(cat.id) ? "rotate-180" : ""}`}
                              />
                            </button>
                          )}
                        </div>
                        {cat.children.length > 0 && expanded.has(cat.id) && (
                          <ul role="list" className="pb-1">
                            <Branch nodes={cat.children} depth={1} onNavigate={close} />
                          </ul>
                        )}
                      </li>
                    ))}
                    <li>
                      <Link
                        href={routes.products}
                        onClick={close}
                        className="flex items-center px-6 py-2.5 text-brand-base font-medium hover:bg-brand-surface-alt transition-colors text-base"
                      >
                        Ver todo
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-brand-muted/20 py-2">
              <Link
                href={routes.favorites}
                onClick={close}
                className="flex items-center gap-3 px-6 py-3 text-brand-ink hover:bg-brand-surface-alt hover:text-brand-base transition-colors text-base font-medium"
              >
                <Heart className="h-4 w-4 shrink-0" aria-hidden="true" />
                Mis favoritos
              </Link>
              <Link
                href={routes.account}
                onClick={close}
                className="flex items-center gap-3 px-6 py-3 text-brand-ink hover:bg-brand-surface-alt hover:text-brand-base transition-colors text-base font-medium"
              >
                <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                Mi cuenta
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

/** Renders nested subcategories as indented links (any depth). */
function Branch({
  nodes,
  depth,
  onNavigate,
}: {
  nodes: CategoryNode[]
  depth: number
  onNavigate: () => void
}) {
  return (
    <>
      {nodes.map((node) => (
        <li key={node.id}>
          <Link
            href={catHref(node.slug)}
            onClick={onNavigate}
            style={{ paddingLeft: `${1.5 + depth * 1}rem` }}
            className="block py-2 pr-6 text-sm text-brand-muted hover:text-brand-base transition-colors"
          >
            {node.name}
          </Link>
          {node.children.length > 0 && (
            <ul role="list">
              <Branch nodes={node.children} depth={depth + 1} onNavigate={onNavigate} />
            </ul>
          )}
        </li>
      ))}
    </>
  )
}
