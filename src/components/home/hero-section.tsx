"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { HeroBanner } from "@/config/store.config"

interface HeroSectionProps {
  banners: HeroBanner[]
  eyebrow: string
  viewAllHref: string
  viewAllLabel: string
}

export function HeroSection({ banners, eyebrow, viewAllHref, viewAllLabel }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)

  if (banners.length === 0) return null

  const banner = banners[Math.min(current, banners.length - 1)]

  return (
    <section
      aria-label="Banner principal"
      className="flex flex-col md:grid md:grid-cols-[45%_55%] md:h-[calc(100dvh-80px)] md:min-h-[560px] overflow-hidden bg-brand-surface"
    >
      {/* ── Imagen ─────────────────────────────────────────────────────
          order-first: aparece ARRIBA en mobile (antes del texto)
          md:order-2:  vuelve a la segunda columna en desktop
      ───────────────────────────────────────────────────────────────── */}
      <div className="order-first md:order-2 relative h-[56dvh] md:h-auto overflow-hidden">
        {banners.map((b, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={i !== current}
          >
            <Image
              src={b.image}
              alt=""
              fill
              className="object-cover"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          </div>
        ))}
      </div>

      {/* ── Texto ──────────────────────────────────────────────────────
          md:order-1: primera columna en desktop (segunda en DOM → sin h1 duplicado)
      ───────────────────────────────────────────────────────────────── */}
      <div className="order-last md:order-1 flex flex-col justify-center bg-brand-surface px-6 py-8 md:px-10 lg:px-16 xl:px-20">
        <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-5">
          {eyebrow}
        </p>
        <h1 className="font-display font-black leading-[1.05] text-brand-ink mb-5 text-balance text-[clamp(2.25rem,4.2vw,4.25rem)]">
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
            href={viewAllHref}
            className="text-sm font-display font-semibold text-brand-muted hover:text-brand-ink underline-offset-4 hover:underline transition-colors"
          >
            {viewAllLabel}
          </Link>
        </div>

        {banners.length > 1 && (
          <div className="flex gap-2 mt-10" role="tablist" aria-label="Seleccionar banner">
            {banners.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Banner ${i + 1}`}
                onClick={() => setCurrent(i)}
                className="p-2 -m-2 group"
              >
                <span
                  className={`block h-[3px] rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-brand-base w-8"
                      : "bg-brand-muted/30 w-4 group-hover:bg-brand-muted/60"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
