"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, Heart, User } from "lucide-react"
import { navigation, routes } from "@/config/store.config"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        className="md:hidden p-2 rounded-md text-brand-ink hover:bg-brand-surface-alt transition-colors"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <nav
            id="mobile-nav-drawer"
            aria-label="Navegación móvil"
            className="absolute left-0 top-0 h-full w-72 bg-brand-surface shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-brand-muted/30">
              <span className="font-display font-bold text-xl text-brand-ink">Menú</span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú"
                className="p-2 rounded-md text-brand-ink hover:bg-brand-surface-alt transition-colors"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Search shortcut */}
            <div className="px-4 py-3 border-b border-brand-muted/20">
              <Link
                href={routes.search}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-surface-alt text-brand-muted hover:text-brand-base transition-colors"
                aria-label="Ir al buscador"
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="text-sm">Buscar productos…</span>
              </Link>
            </div>

            <ul className="flex flex-col py-4" role="list">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-6 py-3 text-brand-ink hover:bg-brand-surface-alt hover:text-brand-base transition-colors text-base font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={routes.favorites}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-brand-ink hover:bg-brand-surface-alt hover:text-brand-base transition-colors text-base font-medium"
                >
                  <Heart className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Mis Favoritos
                </Link>
              </li>
              <li>
                <Link
                  href={routes.account}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-brand-ink hover:bg-brand-surface-alt hover:text-brand-base transition-colors text-base font-medium"
                >
                  <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}
