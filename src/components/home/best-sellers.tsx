import { Flame } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/types"

interface BestSellersProps {
  products: Product[]
  eyebrow?: string
  heading?: string
}

/** Home section showcasing the best-selling products (ranked by real sales). */
export function BestSellers({
  products,
  eyebrow = "Lo más pedido",
  heading = "Más vendidos",
}: BestSellersProps) {
  if (products.length === 0) return null

  return (
    <section aria-labelledby="best-sellers-heading" className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 md:mb-10">
          <p className="flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-2">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            {eyebrow}
          </p>
          <h2
            id="best-sellers-heading"
            className="font-display font-black text-3xl md:text-4xl text-brand-ink"
          >
            {heading}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      </div>
    </section>
  )
}
