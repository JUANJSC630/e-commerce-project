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

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dulce Infancia Shop",
  description: "Ropa adorable para los más pequeños.",
  generator: "v0.dev",
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
      className={`${montserrat.variable} ${inter.variable}`}
    >
      <body>
        <RadixThemeProvider>
          <CartProvider>
            <header className="py-4 border-b border-brand-taupe/50 bg-brand-offWhite sticky top-0 z-50 bg-white">
              <div className="container mx-auto px-4 flex justify-between items-center">
                <Link
                  href="/"
                  className="font-montserrat font-bold text-2xl text-brand-charcoal"
                >
                  Dulce Infancia
                </Link>
                <nav className="hidden md:flex space-x-6 items-center">
                  <Link
                    href="/category/babies" // Ruta actualizada
                    className="text-brand-charcoal hover:text-brand-goldenYellow transition-colors"
                  >
                    Bebés {/* Texto actualizado */}
                  </Link>
                  <Link
                    href="/category/girls" // Ruta actualizada
                    className="text-brand-charcoal hover:text-brand-goldenYellow transition-colors"
                  >
                    Niñas {/* Texto actualizado */}
                  </Link>
                  <Link
                    href="/category/boys" // Ruta actualizada
                    className="text-brand-charcoal hover:text-brand-goldenYellow transition-colors"
                  >
                    Niños {/* Texto actualizado */}
                  </Link>
                  <Link
                    href="/category/sales" // Ruta actualizada
                    className="text-brand-charcoal hover:text-brand-goldenYellow transition-colors"
                  >
                    Ofertas {/* Texto actualizado */}
                  </Link>
                  <Link
                    href="/essentials" // Nueva ruta
                    className="text-brand-charcoal hover:text-brand-goldenYellow transition-colors"
                  >
                    Esenciales {/* Nuevo enlace */}
                  </Link>
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
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                // Define default options
                className: "",
                duration: 5000,
                removeDelay: 1000,
                style: {
                  background: "#fff",
                  color: "#363636",
                },

                // Default options for specific types
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "green",
                    secondary: "black",
                  },
                },
              }}
            />
            <footer className="py-10 bg-brand-charcoal text-brand-offWhite border-t border-brand-taupe/50">
              <div className="container mx-auto px-4 text-center">
                <p>
                  &copy; {new Date().getFullYear()} Dulce Infancia. Todos los
                  derechos reservados.
                </p>
                <p className="text-sm mt-2 text-brand-silver">
                  Diseñado con cariño para los más pequeños.
                </p>
              </div>
            </footer>
            {/* ThemePanel is now integrated within RadixThemeProvider when in dev mode */}
          </CartProvider>
        </RadixThemeProvider>
      </body>
    </html>
  );
}
