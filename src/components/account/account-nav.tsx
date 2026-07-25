"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  MapPin,
  Package,
  Heart,
  ListChecks,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import { LogoutButton } from "@/components/account/logout-button"

interface AccountNavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Exact-match only (e.g. the index route), so child routes don't light it up. */
  exact?: boolean
}

/**
 * Account sidebar entries, in the recommended order. Only sections that exist
 * today are listed; payment methods stay deferred (see ROADMAP Bloque 24).
 */
const ITEMS: AccountNavItem[] = [
  { href: "/cuenta", label: "Perfil", icon: User, exact: true },
  { href: "/cuenta/direcciones", label: "Direcciones", icon: MapPin },
  { href: "/cuenta/pedidos", label: "Pedidos", icon: Package },
  { href: "/cuenta/favoritos", label: "Favoritos", icon: Heart },
  { href: "/cuenta/listas", label: "Listas guardadas", icon: ListChecks },
  { href: "/cuenta/seguridad", label: "Seguridad", icon: ShieldCheck },
]

const rowClass =
  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"

/** Left-hand navigation for the account dashboard, with active-route highlight. */
export function AccountNav() {
  const pathname = usePathname()

  const isActive = (item: AccountNavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <nav aria-label="Secciones de la cuenta" className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const active = isActive(item)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${rowClass} ${
              active
                ? "bg-brand-surface-alt text-brand-base"
                : "text-brand-ink hover:bg-brand-surface-alt hover:text-brand-base"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}

      <LogoutButton
        className={`${rowClass} mt-1 w-full text-brand-muted hover:bg-brand-surface-alt hover:text-destructive`}
      />
    </nav>
  )
}
