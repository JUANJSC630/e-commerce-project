import type React from "react"
import dynamic from "next/dynamic"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { AccountDialogProvider } from "@/components/account/account-dialog"
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
import { CookieConsent } from "@/components/layout/cookie-consent"
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts"

const MiniCart = dynamic(() => import("@/components/cart/mini-cart").then((m) => m.MiniCart))

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [navItems, categoryTree, settings, session] = await Promise.all([
    getNavItems(),
    getCategoryTree(),
    loadAllSettings(),
    getServerSession(authOptions),
  ])
  const { brand, theme, headerLinks } = settings
  const isAuthenticated = Boolean(session)
  const userName = session?.user?.name ?? null

  return (
    <SettingsProvider settings={settings}>
      <AnalyticsScripts />
      <ThemeStyle />
      <FontStyle />
      <div
        className="dulce-theme bg-background text-foreground"
        data-button-style={theme.buttonStyle}
      >
        <CartProvider>
          <FavoritesProvider>
            <AccountDialogProvider>
              <PromoBanner />
              <SiteHeader
                brand={brand}
                categoryTree={categoryTree}
                headerLinks={headerLinks}
                isAuthenticated={isAuthenticated}
                userName={userName}
              />
              <MiniCart />
              <main className="min-h-screen">{children}</main>
              <Footer navItems={navItems} />
              <NewsletterPopup />
              <WhatsAppFloat />
              <CookieConsent />
            </AccountDialogProvider>
          </FavoritesProvider>
        </CartProvider>
      </div>
    </SettingsProvider>
  )
}
