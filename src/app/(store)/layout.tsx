import type React from "react"
import dynamic from "next/dynamic"
import { CartProvider } from "@/components/cart/cart-provider"
import { FavoritesProvider } from "@/components/favorites/favorites-provider"
import { PromoBanner } from "@/components/layout/promo-banner"
import { SiteHeader } from "@/components/layout/site-header"
import { Footer } from "@/components/layout/footer"
import { getCategoryTree, getNavItems } from "@/lib/categories"
import { loadAllSettings } from "@/lib/settings"
import { SettingsProvider } from "@/components/providers/settings-provider"
import { ThemeStyle } from "@/components/theme/theme-style"
import { FontStyle } from "@/components/theme/font-style"
import { NewsletterPopup } from "@/components/home/newsletter-popup"
import { WhatsAppFloat } from "@/components/layout/whatsapp-float"

const MiniCart = dynamic(() => import("@/components/cart/mini-cart").then((m) => m.MiniCart))

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [navItems, categoryTree, settings] = await Promise.all([
    getNavItems(),
    getCategoryTree(),
    loadAllSettings(),
  ])
  const { brand, theme, headerLinks } = settings

  return (
    <SettingsProvider settings={settings}>
      <ThemeStyle />
      <FontStyle />
      <div
        className="dulce-theme bg-background text-foreground"
        data-button-style={theme.buttonStyle}
      >
        <CartProvider>
          <FavoritesProvider>
            <PromoBanner />
            <SiteHeader brand={brand} categoryTree={categoryTree} headerLinks={headerLinks} />
            <MiniCart />
            <main className="min-h-screen">{children}</main>
            <Footer navItems={navItems} />
            <NewsletterPopup />
            <WhatsAppFloat />
          </FavoritesProvider>
        </CartProvider>
      </div>
    </SettingsProvider>
  )
}
