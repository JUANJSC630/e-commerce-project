import Image from "next/image"
import Link from "next/link"
import type { FeaturedCategory } from "@/config/store.config"

interface CategoriesSectionProps {
  categories: FeaturedCategory[]
  eyebrow: string
  heading: string
}

export function CategoriesSection({ categories, eyebrow, heading }: CategoriesSectionProps) {
  if (categories.length === 0) return null

  return (
    <section aria-label={eyebrow} className="py-14 md:py-20 bg-brand-surface-alt">
      <div className="container mx-auto px-4">
        <div className="mb-8 md:mb-10">
          <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-brand-base mb-2">
            {eyebrow}
          </p>
          <h2 className="font-display font-black text-3xl md:text-4xl text-brand-ink">{heading}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-brand-surface shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.imageAlt || category.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
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
  )
}
