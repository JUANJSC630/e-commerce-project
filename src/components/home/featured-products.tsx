import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/types"

interface FeaturedProductsProps {
  products: Product[]
  eyebrow: string
  heading: string
  viewAllHref: string
  viewAllLabel: string
  viewAllMobileLabel: string
}

export function FeaturedProducts({
  products,
  eyebrow,
  heading,
  viewAllHref,
  viewAllLabel,
  viewAllMobileLabel,
}: FeaturedProductsProps) {
  return (
    <section aria-label="Productos destacados" className="py-14 md:py-20 bg-brand-surface-alt">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-2">
              {eyebrow}
            </p>
            <h2 className="font-display font-black text-3xl md:text-4xl text-brand-ink">
              {heading}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-display font-semibold text-brand-muted hover:text-brand-ink transition-colors shrink-0 pb-1"
          >
            {viewAllLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>

        <div className="mt-10 flex justify-center md:hidden">
          <Button variant="outline" size="lg" asChild>
            <Link href={viewAllHref} className="inline-flex items-center gap-2">
              {viewAllMobileLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
