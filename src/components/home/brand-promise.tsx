import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface BrandPromiseProps {
  quote: string
  subtext: string
  ctaLabel: string
  ctaHref: string
  sectionLabel?: string
}

export function BrandPromise({
  quote,
  subtext,
  ctaLabel,
  ctaHref,
  sectionLabel = "Nuestra promesa",
}: BrandPromiseProps) {
  return (
    <section aria-label={sectionLabel} className="py-16 md:py-28 bg-brand-surface">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          {/* <p> not <blockquote>: blockquote implies an external source; this is the brand's own voice */}
          <p className="font-display font-black text-[clamp(1.75rem,3.8vw,3.25rem)] leading-[1.1] text-brand-ink text-balance">
            &ldquo;{quote}&rdquo;
          </p>
          <p className="mt-5 text-base md:text-lg text-brand-muted leading-relaxed max-w-lg">
            {subtext}
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 mt-6 text-sm font-display font-bold text-brand-base hover:text-brand-ink transition-colors underline-offset-4 hover:underline"
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
