"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Package, Gift, ShieldCheck, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { allMockProducts } from "@/lib/mock-data"
import { heroBanners, featuredCategories, homeFeatures, routes } from "@/config/store.config"
import type { LucideIcon } from "lucide-react"

const iconMap: Record<string, LucideIcon> = { Package, Gift, ShieldCheck, Tag }

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const banner = heroBanners[currentBanner]
  const products = allMockProducts.slice(0, 8)

  return (
    <main>
      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Split asimétrico en desktop · Full-bleed en mobile
          Sin autoplay. El carrusel automático destruye conversión en 2026.
          Navegación manual con indicadores estilo "pill" (no dots).
      ═══════════════════════════════════════════════════════════════════ */}
      <section aria-label="Banner principal" className="relative overflow-hidden bg-brand-surface">
        {/* ── Desktop: grid 45 / 55 ─────────────────────────────────── */}
        <div className="hidden md:grid md:grid-cols-[45%_55%] md:h-[calc(100dvh-80px)] md:min-h-[560px]">
          {/* Texto */}
          <div className="flex flex-col justify-center px-10 lg:px-16 xl:px-20 py-16 bg-brand-surface">
            <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-5">
              Nueva temporada
            </p>
            <h1 className="font-display font-black leading-[1.05] text-brand-ink mb-5 text-balance text-[clamp(2.5rem,4.2vw,4.25rem)]">
              {banner.title}
            </h1>
            <p className="text-base lg:text-lg text-brand-muted leading-relaxed mb-8 max-w-sm">
              {banner.description}
            </p>
            <div className="flex items-center gap-5">
              <Button size="lg" asChild>
                <Link href={banner.buttonLink} className="flex items-center gap-2">
                  {banner.buttonText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                href={routes.products}
                className="text-sm font-display font-semibold text-brand-muted hover:text-brand-ink underline-offset-4 hover:underline transition-colors"
              >
                Ver todo
              </Link>
            </div>

            {/* Indicadores de banner — pill style, sin autoplay */}
            {heroBanners.length > 1 && (
              <div className="flex gap-2 mt-12" role="tablist" aria-label="Seleccionar banner">
                {heroBanners.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === currentBanner}
                    aria-label={`Banner ${i + 1}`}
                    onClick={() => setCurrentBanner(i)}
                    className="p-2 -m-2 group"
                  >
                    <span
                      className={`block h-[3px] rounded-full transition-all duration-400 ${
                        i === currentBanner
                          ? "bg-brand-base w-8"
                          : "bg-brand-muted/30 w-4 group-hover:bg-brand-muted/60"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Imagen */}
          <div className="relative overflow-hidden">
            {heroBanners.map((b, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === currentBanner ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={i !== currentBanner}
              >
                <Image src={b.image} alt="" fill className="object-cover" priority={i === 0} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile: full-bleed con texto anclado abajo-izquierda ────── */}
        <div className="md:hidden relative min-h-[92dvh]">
          {heroBanners.map((b, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === currentBanner ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== currentBanner}
            >
              <Image src={b.image} alt="" fill className="object-cover" priority={i === 0} />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
            <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-3">
              Nueva temporada
            </p>
            <h1 className="font-display font-black text-[2.4rem] leading-[1.05] text-white mb-3 text-balance">
              {banner.title}
            </h1>
            <p className="text-sm text-white/75 mb-5 max-w-xs leading-relaxed">
              {banner.description}
            </p>
            <div className="flex items-center gap-4">
              <Button size="default" asChild>
                <Link href={banner.buttonLink} className="flex items-center gap-2">
                  {banner.buttonText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {heroBanners.length > 1 && (
                <div className="flex gap-2" role="tablist" aria-label="Seleccionar banner">
                  {heroBanners.map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === currentBanner}
                      aria-label={`Banner ${i + 1}`}
                      onClick={() => setCurrentBanner(i)}
                      className="p-2 -m-2"
                    >
                      <span
                        className={`block h-[3px] rounded-full transition-all duration-300 ${
                          i === currentBanner ? "bg-white w-6" : "bg-white/35 w-3.5"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TRUST BAR — Marquee continuo en verde salvia
          Reemplaza el icon grid de 4 cards. Una sola franja dinámica
          comunica todas las garantías sin interrumpir el scroll.
          Refs: Misha & Puff, Mini Rodini, Bobo Choses 2026
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-brand-base overflow-hidden py-3" aria-label="Nuestras garantías">
        <div className="flex animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
          {[...homeFeatures, ...homeFeatures, ...homeFeatures].map((item, i) => {
            const Icon = iconMap[item.icon]
            return (
              <span
                key={i}
                className="inline-flex items-center gap-2.5 px-7 text-sm font-display font-semibold text-brand-on-base"
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />}
                <span>{item.title}</span>
                {item.description && (
                  <span className="text-brand-on-base/55 font-normal">— {item.description}</span>
                )}
                <span className="ml-5 text-brand-on-base/30">·</span>
              </span>
            )
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CATEGORÍAS — Grid de colecciones
          Headings alineados a la izquierda (no centrados).
          Eyebrow + título jerárquico — patrón editorial 2026.
      ═══════════════════════════════════════════════════════════════════ */}
      <section aria-label="Colecciones" className="py-14 md:py-20 bg-brand-surface-alt">
        <div className="container mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-2">
              Colecciones
            </p>
            <h2 className="font-display font-black text-3xl md:text-4xl text-brand-ink">
              Encuentra lo que buscas
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {featuredCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-brand-surface shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/65 via-brand-ink/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 md:p-5">
                  <h3 className="font-display font-bold text-base md:text-lg text-white group-hover:text-brand-base transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BRAND PROMISE — Declaración editorial de marca
          Reemplaza el "Por qué elegirnos" genérico. Una sola frase grande
          con carácter. Basado en Caramel, Kindred of Ireland y Misha & Puff.
          Tipografía display a tamaño máximo = elemento visual, no solo texto.
      ═══════════════════════════════════════════════════════════════════ */}
      <section aria-label="Nuestra promesa" className="py-16 md:py-28 bg-brand-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <blockquote className="font-display font-black text-[clamp(1.75rem,3.8vw,3.25rem)] leading-[1.1] text-brand-ink text-balance">
              &ldquo;Cada prenda que ves aquí fue elegida a mano — como si fuera para nuestra propia
              familia.&rdquo;
            </blockquote>
            <p className="mt-5 text-base md:text-lg text-brand-muted leading-relaxed max-w-lg">
              No tenemos el catálogo más grande. Tenemos el que tiene sentido.
            </p>
            <Link
              href={routes.products}
              className="inline-flex items-center gap-2 mt-6 text-sm font-display font-bold text-brand-base hover:text-brand-ink transition-colors underline-offset-4 hover:underline"
            >
              Conocer la selección <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PRODUCTOS DESTACADOS — Grid curado
          Header con eyebrow + link "Ver todo" a la derecha en desktop.
          Mobile: link al final.
          4 productos con priority={true} para LCP óptimo.
      ═══════════════════════════════════════════════════════════════════ */}
      <section aria-label="Productos destacados" className="py-14 md:py-20 bg-brand-surface-alt">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8 md:mb-10 gap-4">
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-2">
                Selección de la semana
              </p>
              <h2 className="font-display font-black text-3xl md:text-4xl text-brand-ink">
                Lo más querido
              </h2>
            </div>
            <Link
              href={routes.products}
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-display font-semibold text-brand-muted hover:text-brand-ink transition-colors shrink-0 pb-1"
            >
              Ver todo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>

          <div className="mt-10 flex justify-center md:hidden">
            <Button variant="outline" size="lg" asChild>
              <Link href={routes.products} className="inline-flex items-center gap-2">
                Ver todos los productos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
