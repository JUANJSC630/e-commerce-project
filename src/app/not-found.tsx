import Link from "next/link"
import { brand, routes } from "@/config/store.config"
import { getNavItems } from "@/lib/categories"

export default async function NotFound() {
  const navItems = await getNavItems()
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-display font-bold text-brand-base">404</p>
      <h1 className="mt-4 text-2xl font-display font-semibold text-foreground">
        Página no encontrada
      </h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        La página que buscas no existe o fue movida. Pero en {brand.name} siempre hay algo lindo
        esperándote.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={routes.home}
          className="px-5 py-2.5 bg-brand-base text-brand-on-base rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Ir al inicio
        </Link>
        <Link
          href={routes.products}
          className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-brand-surface-alt transition-colors"
        >
          Ver productos
        </Link>
      </div>
      <nav className="mt-10" aria-label="Categorías disponibles">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          O explora nuestras colecciones
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm text-brand-base hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
