import type { Metadata } from "next"
import { HeroSection } from "@/components/home/hero-section"
import { TrustBar } from "@/components/home/trust-bar"
import { CategoryPills } from "@/components/home/category-pills"
import { CategoriesSection } from "@/components/home/categories-section"
import { BrandPromise } from "@/components/home/brand-promise"
import { FeaturedProducts } from "@/components/home/featured-products"
import { BestSellers } from "@/components/home/best-sellers"
import { GenderSection } from "@/components/home/gender-section"
import { InstagramFeed } from "@/components/home/instagram-feed"
import { SeoContent } from "@/components/home/seo-content"
import { routes } from "@/config/store.config"
import { getBestSellingProducts, getFeaturedProducts, getProductsByCategory } from "@/lib/products"
import { loadAllSettings } from "@/lib/settings"
import { getActiveCategories } from "@/lib/categories"
import { pageMetadata } from "@/lib/seo"

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home")
}

export default async function HomePage() {
  const [settings, activeCategories] = await Promise.all([loadAllSettings(), getActiveCategories()])
  const { homeContent, brand, social } = settings
  const { heroBanners, featuredCategories, homeFeatures, copy } = homeContent
  const { hero, categories, promise, products } = copy

  const [featuredProducts, bestSellers, boysProducts, girlsProducts] = await Promise.all([
    getFeaturedProducts(products.limit),
    getBestSellingProducts(8),
    getProductsByCategory("boys"),
    getProductsByCategory("girls"),
  ])

  // Category pills from active DB categories
  const categoryPills = activeCategories.map((cat) => ({
    label: cat.name,
    href: `${routes.categoryBase}/${cat.slug}`,
  }))

  // Shoppable Instagram tiles from real product photos (deduped, no placeholders).
  const instagramPosts = [...bestSellers, ...featuredProducts]
    .filter(
      (p, i, arr) =>
        p.image && p.image !== "/placeholder.svg" && arr.findIndex((q) => q.id === p.id) === i,
    )
    .slice(0, 6)
    .map((p) => ({ image: p.image, href: `/products/${p.id}`, alt: p.name }))

  return (
    <main>
      <HeroSection
        banners={heroBanners}
        eyebrow={hero.eyebrow}
        viewAllHref={routes.products}
        viewAllLabel={hero.viewAllLabel}
      />
      <CategoryPills pills={categoryPills} />
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
      <BestSellers products={bestSellers} />
      <GenderSection
        title="Esenciales por Género"
        tabs={[
          { label: "Niños", products: boysProducts },
          { label: "Niñas", products: girlsProducts },
        ]}
      />
      <InstagramFeed instagram={social.instagram} posts={instagramPosts} />
      <SeoContent brandName={brand.name} />
    </main>
  )
}
