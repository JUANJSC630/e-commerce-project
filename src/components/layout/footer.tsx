"use client"

import Link from "next/link"
import { brand, navigation, routes, locale } from "@/config/store.config"
import { Instagram, Facebook, Twitter } from "lucide-react"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-ink text-brand-surface" aria-label="Pie de página">
      {/* Main footer grid */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link
              href={routes.home}
              className="font-display font-bold text-xl text-brand-surface hover:text-brand-base transition-colors"
            >
              {brand.name}
            </Link>
            <p className="mt-3 text-sm text-brand-surface/70 leading-relaxed max-w-xs">
              {brand.description}
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Instagram"
                className="p-2 rounded-full bg-brand-surface/10 hover:bg-brand-base hover:text-brand-on-base transition-colors"
              >
                <Instagram className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Facebook"
                className="p-2 rounded-full bg-brand-surface/10 hover:bg-brand-base hover:text-brand-on-base transition-colors"
              >
                <Facebook className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en X (Twitter)"
                className="p-2 rounded-full bg-brand-surface/10 hover:bg-brand-base hover:text-brand-on-base transition-colors"
              >
                <Twitter className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <h2 className="font-display font-semibold text-sm uppercase tracking-widest text-brand-surface/50 mb-4">
              Colecciones
            </h2>
            <ul className="space-y-2.5" role="list">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-brand-surface/80 hover:text-brand-base transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={routes.products}
                  className="text-sm text-brand-surface/80 hover:text-brand-base transition-colors"
                >
                  Todos los productos
                </Link>
              </li>
            </ul>
          </div>

          {/* Help column */}
          <div>
            <h2 className="font-display font-semibold text-sm uppercase tracking-widest text-brand-surface/50 mb-4">
              Ayuda
            </h2>
            <ul className="space-y-2.5" role="list">
              <li>
                <Link
                  href={routes.cart}
                  className="text-sm text-brand-surface/80 hover:text-brand-base transition-colors"
                >
                  Mi carrito
                </Link>
              </li>
              <li>
                <Link
                  href={routes.checkout}
                  className="text-sm text-brand-surface/80 hover:text-brand-base transition-colors"
                >
                  Checkout
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contacto@dulceinfancia.co"
                  className="text-sm text-brand-surface/80 hover:text-brand-base transition-colors"
                >
                  Contacto
                </a>
              </li>
              <li>
                <Link
                  href={routes.policies ?? "/politicas"}
                  className="text-sm text-brand-surface/80 hover:text-brand-base transition-colors"
                >
                  Políticas de envío
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Currency column */}
          <div>
            <h2 className="font-display font-semibold text-sm uppercase tracking-widest text-brand-surface/50 mb-4">
              Información
            </h2>
            <ul className="space-y-2.5 text-sm text-brand-surface/80" role="list">
              <li>
                Moneda:{" "}
                <span className="font-medium text-brand-surface">
                  {locale.currency} ({locale.currencySymbol})
                </span>
              </li>
              <li>Colombia · Envíos internacionales</li>
              <li className="pt-1">
                <a
                  href="mailto:contacto@dulceinfancia.co"
                  className="hover:text-brand-base transition-colors"
                >
                  contacto@dulceinfancia.co
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-surface/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-surface/50">
          <p>
            &copy; {year} {brand.copyright}
          </p>
          <p>{brand.footerSubtext}</p>
        </div>
      </div>
    </footer>
  )
}
