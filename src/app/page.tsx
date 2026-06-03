"use client"

import React from "react"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Package, Gift, ShieldCheck, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { allMockProducts } from "@/lib/mock-data"
import { heroBanners, featuredCategories, homeFeatures, routes } from "@/config/store.config"
import type { LucideIcon } from "lucide-react"

/* Map icon name strings from store.config to actual Lucide components */
const iconMap: Record<string, LucideIcon> = {
  Package,
  Gift,
  ShieldCheck,
  Tag,
}

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const products = allMockProducts.slice(0, 8)

  return (
    <div>
      <main>
        {/* ── Hero Section ────────────────────────────────────────────── */}
        <section
          className="relative h-[calc(100dvh-80px)] min-h-[450px] md:min-h-[500px] lg:min-h-[600px] overflow-hidden"
          aria-label="Banner principal"
        >
          {heroBanners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentBanner ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={index !== currentBanner}
            >
              <Image
                src={banner.image}
                alt=""
                fill
                className="object-cover opacity-70"
                priority={index === 0}
              />
              <div className={`absolute inset-0 ${banner.bgColorClass}`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <h1
                  className={`font-display font-bold text-3xl md:text-5xl lg:text-6xl ${banner.textColorClass} mb-4`}
                >
                  {banner.title}
                </h1>
                <p className={`text-lg md:text-xl ${banner.textColorClass} max-w-2xl mb-8`}>
                  {banner.description}
                </p>
                <Button size="lg" variant="default" asChild>
                  <Link href={banner.buttonLink} className="flex items-center">
                    {banner.buttonText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}

          {/* Carousel indicators */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
            role="tablist"
            aria-label="Indicadores del banner"
          >
            {heroBanners.map((_, index) => (
              <button
                key={index}
                role="tab"
                aria-selected={index === currentBanner}
                aria-label={`Ir al banner ${index + 1}`}
                onClick={() => setCurrentBanner(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors p-3 -m-3 flex items-center justify-center`}
              >
                <span
                  className={`block w-2.5 h-2.5 rounded-full transition-colors ${
                    index === currentBanner
                      ? "bg-brand-base"
                      : "bg-brand-muted/60 hover:bg-brand-muted"
                  }`}
                />
              </button>
            ))}
          </div>
        </section>

        {/* ── Featured Categories ──────────────────────────────────────── */}
        <section className="py-12 md:py-20 bg-brand-surface-alt">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center text-brand-ink mb-10 md:mb-12">
              Explora Nuestras Categorías
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredCategories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-[0.615]"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-brand-ink/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                    <h3 className="font-display text-lg md:text-xl font-semibold text-brand-surface group-hover:text-brand-base transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Products ────────────────────────────────────────── */}
        <section className="py-12 md:py-10 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center text-brand-ink mb-10 md:mb-12">
              Nuestros Favoritos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link href={routes.products} className="flex items-center">
                  Ver Todos los Productos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Features Strip ───────────────────────────────────────────── */}
        <section className="py-12 md:py-20 bg-brand-surface-alt">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {homeFeatures.map((item) => {
                const Icon = iconMap[item.icon]
                return (
                  <div key={item.title} className="flex flex-col items-center p-6">
                    {Icon && <Icon className="w-10 h-10 text-brand-base mb-4" />}
                    <h3 className="font-display font-semibold text-lg text-brand-ink mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-brand-muted">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
