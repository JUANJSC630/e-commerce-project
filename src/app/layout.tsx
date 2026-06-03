import type React from "react";
import type { Metadata } from "next";
import "../styles/globals.css";
import { Montserrat, Inter } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import { Toaster } from "react-hot-toast";
import { MiniCart } from "@/components/cart/mini-cart";
import { CartCounter } from "@/components/cart/cart-counter";
import Link from "next/link";
import { RadixThemeProvider } from "@/components/theme-provider";
import { brand, seo, navigation, routes } from "@/config/store.config";

/*
 * Font loading — to change fonts:
 *  1. Replace the import names and Google Fonts function calls below
 *  2. Update typography.displayFont / typography.bodyFont in src/config/theme.config.ts
 */
const displayFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  generator: seo.generator,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
            <header className="py-4 border-b border-brand-muted/30 bg-brand-surface sticky top-0 z-50">
              <div className="container mx-auto px-4 flex justify-between items-center">
                <Link
                  href={routes.home}
                  className="font-display font-bold text-2xl text-brand-ink"
                >
                  {brand.logoImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logoImage} alt={brand.name} className="h-8 w-auto" />
                  ) : (
                    brand.name
                  )}
                </Link>

                {/* Desktop navigation — items driven by navigation[] in store.config.ts */}
                <nav className="hidden md:flex space-x-6 items-center" aria-label="Navegación principal">
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
                  <CartCounter />
                </div>
              </div>
            </header>

            <MiniCart />
            <main className="min-h-screen">{children}</main>

            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 5000,
                removeDelay: 1000,
                style: {
                  background: "var(--brand-surface)",
                  color: "var(--brand-ink)",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "var(--brand-base)",
                    secondary: "var(--brand-on-base)",
                  },
                },
              }}
            />

            <footer className="py-10 bg-brand-ink text-brand-surface border-t border-brand-muted/30">
              <div className="container mx-auto px-4 text-center">
                <p>
                  &copy; {new Date().getFullYear()} {brand.copyright}
                </p>
                <p className="text-sm mt-2 text-brand-surface/70">
                  {brand.footerSubtext}
                </p>
              </div>
            </footer>
          </CartProvider>
        </RadixThemeProvider>
      </body>
    </html>
  );
}
