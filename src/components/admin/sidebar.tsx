"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Ticket,
  Users,
  Shield,
  Settings,
  Images,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { Resource } from "@/lib/permissions"
import { canManageMedia, hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  resource: Resource
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, resource: "dashboard" },
  { label: "Productos", href: "/admin/productos", icon: Package, resource: "products" },
  { label: "Categorías", href: "/admin/categorias", icon: Tags, resource: "categories" },
  { label: "Descuentos", href: "/admin/descuentos", icon: Ticket, resource: "discounts" },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag, resource: "orders" },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users, resource: "users" },
  { label: "Roles", href: "/admin/roles", icon: Shield, resource: "roles" },
  { label: "Configuración", href: "/admin/settings", icon: Settings, resource: "settings" },
]

const MEDIA_ITEM = { label: "Medios", href: "/admin/media", icon: Images }

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const permissions = session?.user?.role?.permissions as Permissions | undefined
  const canMedia = canManageMedia(permissions)
  const [orphanCount, setOrphanCount] = useState(0)

  // Non-blocking: reads the orphan count from the cached scan (never triggers a
  // CDN scan on its own), so the badge appears without slowing the admin down.
  useEffect(() => {
    if (!canMedia) return
    let active = true
    fetch("/api/admin/media?stats=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => active && data && setOrphanCount(data.orphanCount ?? 0))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [canMedia])

  const visibleItems = [
    ...NAV_ITEMS.filter((item) => hasPermission(permissions, item.resource, "read")),
    // Media isn't a granular Resource — any image-editing role may manage it.
    ...(canMedia ? [MEDIA_ITEM] : []),
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200">
        <Link
          href="/admin"
          className="text-xl font-bold text-slate-900 tracking-tight"
          onClick={() => setMobileOpen(false)}
        >
          Dulce Infancia
          <span className="ml-2 text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
              {item.href === MEDIA_ITEM.href && orphanCount > 0 && (
                <span
                  className={cn(
                    "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                    isActive ? "bg-white/25 text-white" : "bg-red-100 text-red-700",
                  )}
                  title={`${orphanCount} archivos huérfanos`}
                >
                  {orphanCount}
                </span>
              )}
              {isActive && item.href !== MEDIA_ITEM.href && (
                <ChevronRight className="h-3 w-3 ml-auto" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      {session?.user && (
        <div className="px-4 py-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
              {session.user.name?.[0]?.toUpperCase() ?? session.user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">
                {session.user.name ?? session.user.email}
              </p>
              <p className="text-xs text-slate-500">{session.user.role?.name}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg border border-slate-200 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar — sticky so it stays in view while content scrolls. */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200 sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>
    </>
  )
}
