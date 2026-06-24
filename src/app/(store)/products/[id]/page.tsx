import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllProductIds, getProductById, getRelatedProducts } from "@/lib/products"
import { getProductReviews } from "@/lib/reviews"
import { ProductDetail } from "@/components/product/product-detail"
import { ReviewsSection } from "@/components/product/reviews-section"
import { AuthSessionProvider } from "@/components/providers/auth-session-provider"
import { loadAllSettings } from "@/lib/settings"

interface PageProps {
  params: Promise<{ id: string }>
}

// ISR: prebuild known products and refresh on the `products` tag (admin edits)
// or every 5 min. getProductById is cached, so generateMetadata + the page share
// a single query per render instead of hitting the DB twice.
export const revalidate = 300

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const ids = await getAllProductIds()
  return ids.map((id) => ({ id }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const [product, { brand }] = await Promise.all([getProductById(id), loadAllSettings()])

  if (!product) {
    return { title: `Producto no encontrado — ${brand.name}` }
  }

  const title = `${product.name} — ${brand.name}`
  const description =
    product.description ??
    `Compra ${product.name} en ${brand.name}. Ropa infantil de calidad con envío a todo el país.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) notFound()

  const [relatedProducts, reviews] = await Promise.all([
    getRelatedProducts(product),
    getProductReviews(id),
  ])

  return (
    <>
      <ProductDetail product={product} relatedProducts={relatedProducts} />
      <div className="container mx-auto px-4 pb-16">
        <AuthSessionProvider>
          <ReviewsSection productId={id} reviews={reviews} />
        </AuthSessionProvider>
      </div>
    </>
  )
}
