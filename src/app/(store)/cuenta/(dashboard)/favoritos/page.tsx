import type { Metadata } from "next"
import { privatePageMetadata } from "@/lib/seo"
import { FavoritesGrid } from "@/components/favorites/favorites-grid"

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata("Mis favoritos")
}

export default function AccountFavoritesPage() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <h1 className="font-display text-2xl font-bold text-brand-ink">Favoritos</h1>
      <p className="mt-1 text-sm text-brand-muted">Las prendas que guardaste para más tarde.</p>

      <div className="mt-6">
        <FavoritesGrid />
      </div>
    </section>
  )
}
