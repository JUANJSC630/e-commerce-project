import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductById, getRelatedProducts } from "@/lib/products"
import { ProductDetail } from "@/components/product/product-detail"
import { loadAllSettings } from "@/lib/settings"

interface PageProps {
  params: Promise<{ id: string }>
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

  const relatedProducts = await getRelatedProducts(product)

  return <ProductDetail product={product} relatedProducts={relatedProducts} />
}
