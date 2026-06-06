import type { Metadata } from "next"
import { HeroSection } from "@/components/home/hero-section"
import { TrustBar } from "@/components/home/trust-bar"
import { CategoriesSection } from "@/components/home/categories-section"
import { BrandPromise } from "@/components/home/brand-promise"
import { FeaturedProducts } from "@/components/home/featured-products"
import {
  heroBanners,
  featuredCategories,
  homeFeatures,
  homePageContent,
  routes,
} from "@/config/store.config"
import { getFeaturedProducts } from "@/lib/products"
import { pageMetadata } from "@/lib/seo"

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home")
}

export default async function HomePage() {
  const { hero, categories, promise, products } = homePageContent
  const featuredProducts = await getFeaturedProducts(products.limit)

  return (
    <main>
      <HeroSection
        banners={heroBanners}
        eyebrow={hero.eyebrow}
        viewAllHref={routes.products}
        viewAllLabel={hero.viewAllLabel}
      />
      <TrustBar features={homeFeatures} />
      <CategoriesSection
        categories={featuredCategories}
        eyebrow={categories.eyebrow}
        heading={categories.heading}
      />
      <BrandPromise
        quote={promise.quote}
        subtext={promise.subtext}
        ctaLabel={promise.ctaLabel}
        ctaHref={routes.products}
      />
      <FeaturedProducts
        products={featuredProducts}
        eyebrow={products.eyebrow}
        heading={products.heading}
        viewAllHref={routes.products}
        viewAllLabel={products.viewAllLabel}
        viewAllMobileLabel={products.viewAllMobileLabel}
      />
    </main>
  )
}
