import type React from "react"
import type { Metadata } from "next"
import "../styles/globals.css"
import { Nunito, Atkinson_Hyperlegible } from "next/font/google"
import { CartProvider } from "@/components/cart/cart-provider"
import { Toaster } from "@/components/ui/sonner"
import { MiniCart } from "@/components/cart/mini-cart"
import { CartCounter } from "@/components/cart/cart-counter"
import { MobileNav } from "@/components/layout/mobile-nav"
import { SearchBar } from "@/components/search/search-bar"
import { PromoBanner } from "@/components/layout/promo-banner"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { Heart } from "lucide-react"
import { RadixThemeProvider } from "@/components/theme-provider"
import { brand, seo, navigation, routes } from "@/config/store.config"

/*
 * Font loading — to change fonts:
 *  1. Replace the import names and Google Fonts function calls below
 *  2. Update typography.displayFont / typography.bodyFont in src/config/theme.config.ts
 */
const displayFont = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

const bodyFont = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  generator: seo.generator,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body>
        <RadixThemeProvider>
          <CartProvider>
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

                {/* Desktop navigation — items driven by navigation[] in store.config.ts */}
                <nav
                  className="hidden md:flex space-x-6 items-center"
                  aria-label="Navegación principal"
                >
                  {navigation.map((item) => (
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
                  <CartCounter />
                  <MobileNav />
                </div>
              </div>
            </header>

            <MiniCart />
            <main className="min-h-screen">{children}</main>

            <Toaster position="top-right" richColors closeButton />

            <Footer />
          </CartProvider>
        </RadixThemeProvider>
      </body>
    </html>
  )
}
