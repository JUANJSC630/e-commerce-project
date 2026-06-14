"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavItem } from "@/config/store.config"

/**
 * Admin-curated header links (editable in Configuración → Menú). These are the
 * merchandising entries — "Novedades", "Ofertas", a seasonal drop — separate
 * from the product categories, which live in the "Categorías" mega-menu.
 */
export function HeaderNav({ links }: { links: NavItem[] }) {
  const pathname = usePathname()
  if (links.length === 0) return null

  return (
    <ul className="flex items-center gap-7" role="list">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <li key={`${link.label}-${link.href}`} className="relative">
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center h-11 text-sm tracking-wide transition-colors ${
                active
                  ? "text-brand-base font-semibold"
                  : "text-brand-ink/80 hover:text-brand-base font-medium"
              }`}
            >
              {link.label}
            </Link>
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-base"
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}
