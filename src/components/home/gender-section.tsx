"use client"

import { useState } from "react"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/types"

interface GenderTab {
  label: string
  products: Product[]
}

interface GenderSectionProps {
  title: string
  tabs: GenderTab[]
  /** Grid column classes from the active card-size setting. */
  gridClassName?: string
}

export function GenderSection({
  title,
  tabs,
  gridClassName = "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3",
}: GenderSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  if (tabs.length === 0) return null

  const activeProducts = tabs[activeIdx]?.products ?? []

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-ink">{title}</h2>
          <div className="flex gap-1 bg-brand-surface rounded-lg p-1">
            {tabs.map((tab, idx) => (
              <button
                key={tab.label}
                onClick={() => setActiveIdx(idx)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeIdx === idx
                    ? "bg-brand-base text-brand-on-base shadow-sm"
                    : "text-brand-muted hover:text-brand-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`grid ${gridClassName} gap-4 md:gap-6`}>
          {activeProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {activeProducts.length === 0 && (
          <p className="text-center text-brand-muted py-8">
            Próximamente más productos en esta sección.
          </p>
        )}
      </div>
    </section>
  )
}
