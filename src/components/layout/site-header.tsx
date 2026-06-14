import Link from "next/link"
import Image from "next/image"
import { Heart, User } from "lucide-react"
import { routes } from "@/config/store.config"
import type { NavItem } from "@/config/store.config"
import type { CategoryNode } from "@/lib/categories"
import { CartCounter } from "@/components/cart/cart-counter"
import { MobileNav } from "@/components/layout/mobile-nav"
import { SearchBar } from "@/components/search/search-bar"
import { HeaderSearch } from "@/components/layout/header-search"
import { CategoryMegaMenu } from "@/components/layout/category-mega-menu"
import { HeaderNav } from "@/components/layout/header-nav"

interface SiteHeaderProps {
  brand: { name: string; logoImage: string | null }
  categoryTree: CategoryNode[]
  headerLinks: NavItem[]
}

/**
 * Storefront header. Two tiers: a primary row (logo · inline search · account /
 * favorites / cart) and a navigation row — a "Categorías" mega-menu of products
 * plus admin-curated links. Built for a wide, mixed-age audience: search is
 * surfaced, actions carry labels on desktop, touch targets stay generous.
 */
export function SiteHeader({ brand, categoryTree, headerLinks }: SiteHeaderProps) {
  const logo = brand.logoImage ? (
    <Image
      src={brand.logoImage}
      alt={brand.name}
      width={0}
      height={0}
      sizes="200px"
      priority
      className="h-8 w-auto"
    />
  ) : (
    brand.name
  )

  return (
    <header className="sticky top-0 z-50 bg-brand-surface/95 backdrop-blur supports-[backdrop-filter]:bg-brand-surface/80 border-b border-brand-muted/20">
      {/* Primary row */}
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 md:gap-6 h-16">
          <div className="md:hidden">
            <MobileNav tree={categoryTree} links={headerLinks} />
          </div>

          <Link
            href={routes.home}
            className="font-display font-bold text-xl md:text-2xl text-brand-ink whitespace-nowrap shrink-0"
            aria-label={`${brand.name} — inicio`}
          >
            {logo}
          </Link>

          <HeaderSearch className="hidden md:flex flex-1 max-w-xl mx-auto" />

          <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0">
            <div className="md:hidden">
              <SearchBar />
            </div>

            <Link
              href={routes.favorites}
              aria-label="Mis favoritos"
              className="hidden md:inline-flex items-center justify-center h-10 w-10 rounded-full text-brand-ink hover:text-brand-base hover:bg-brand-surface-alt transition-colors"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
            </Link>

            <Link
              href={routes.account}
              className="hidden md:inline-flex items-center gap-2 h-10 px-3 rounded-full text-brand-ink hover:text-brand-base hover:bg-brand-surface-alt transition-colors"
            >
              <User className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-medium">Cuenta</span>
            </Link>

            <CartCounter />
          </div>
        </div>
      </div>

      {/* Navigation row — categories mega-menu + curated links */}
      <div className="hidden md:block border-t border-brand-muted/15">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12">
            <CategoryMegaMenu tree={categoryTree} />
            <div className="flex-1 flex justify-center">
              <HeaderNav links={headerLinks} />
            </div>
            {/* right slot reserved for a future CTA, kept balanced for centering */}
            <div className="w-[7.5rem]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </header>
  )
}
