import type React from "react"
import dynamic from "next/dynamic"
import { CartProvider } from "@/components/cart/cart-provider"
import { FavoritesProvider } from "@/components/favorites/favorites-provider"
import { CartCounter } from "@/components/cart/cart-counter"
import { MobileNav } from "@/components/layout/mobile-nav"
import { SearchBar } from "@/components/search/search-bar"
import { PromoBanner } from "@/components/layout/promo-banner"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { Heart, User } from "lucide-react"
import { routes } from "@/config/store.config"
import { getNavItems } from "@/lib/categories"
import { loadAllSettings } from "@/lib/settings"
import { SettingsProvider } from "@/components/providers/settings-provider"

const MiniCart = dynamic(() => import("@/components/cart/mini-cart").then((m) => m.MiniCart))

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [navItems, settings] = await Promise.all([getNavItems(), loadAllSettings()])
  const { brand } = settings

  return (
    <SettingsProvider settings={settings}>
      <CartProvider>
        <FavoritesProvider>
          <PromoBanner />
          <header className="py-4 border-b border-brand-muted/30 bg-brand-surface sticky top-0 z-50">
            <div className="container mx-auto px-4 flex justify-between items-center">
              <Link href={routes.home} className="font-display font-bold text-2xl text-brand-ink">
                {brand.logoImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brand.logoImage} alt={brand.name} className="h-8 w-auto" />
                ) : (
                  brand.name
                )}
              </Link>

              <nav
                className="hidden md:flex space-x-6 items-center"
                aria-label="Navegación principal"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-brand-ink hover:text-brand-base transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center space-x-4">
                <SearchBar />
                <Link
                  href={routes.favorites}
                  aria-label="Mis favoritos"
                  className="hidden md:flex p-2 rounded-md text-brand-ink hover:text-brand-base hover:bg-brand-surface-alt transition-colors"
                >
                  <Heart className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href={routes.account}
                  aria-label="Mi cuenta"
                  className="hidden md:flex p-2 rounded-md text-brand-ink hover:text-brand-base hover:bg-brand-surface-alt transition-colors"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                </Link>
                <CartCounter />
                <MobileNav navItems={navItems} />
              </div>
            </div>
          </header>

          <MiniCart />
          <main className="min-h-screen">{children}</main>
          <Footer navItems={navItems} />
        </FavoritesProvider>
      </CartProvider>
    </SettingsProvider>
  )
}
