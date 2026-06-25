import Image from "next/image"
import Link from "next/link"
import { Star, Quote } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TestimonialDTO } from "@/lib/reviews"

interface TestimonialsProps {
  testimonials: TestimonialDTO[]
}

/** Home section showcasing standout customer reviews next to the product reviewed. */
export function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) return null

  return (
    <section aria-labelledby="testimonials-heading" className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-2">
            Lo que dicen
          </p>
          <h2
            id="testimonials-heading"
            className="font-display font-black text-3xl md:text-4xl text-brand-ink"
          >
            Familias que ya nos eligieron
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.slice(0, 3).map((t) => (
            <figure
              key={t.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <Quote className="h-6 w-6 text-brand-base/40" aria-hidden="true" />
              <div className="flex mt-3 mb-2" aria-label={`${t.rating} de 5 estrellas`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i <= t.rating ? "text-brand-base fill-brand-base" : "text-brand-muted",
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="text-sm text-muted-foreground leading-relaxed flex-1">
                “{t.comment}”
              </blockquote>

              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-base/15 text-sm font-semibold text-brand-base"
                  aria-hidden="true"
                >
                  {t.authorName.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-brand-ink truncate">
                    {t.authorName}
                  </span>
                  <Link
                    href={`/products/${t.productId}`}
                    className="block text-xs text-muted-foreground truncate hover:text-brand-base transition-colors"
                  >
                    sobre {t.productName}
                  </Link>
                </span>
                <Link
                  href={`/products/${t.productId}`}
                  aria-label={`Ver ${t.productName}`}
                  className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-surface"
                >
                  <Image
                    src={t.productImage || "/placeholder.svg"}
                    alt={t.productName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
