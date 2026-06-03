"use client"

import { use, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Star,
  ChevronRight,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getProductById, getRelatedProducts } from "@/lib/mock-data"
import { ProductCard } from "@/components/product/product-card"
import { useCart } from "@/hooks/use-cart"
import { locale, shipping, routes } from "@/config/store.config"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const product = getProductById(id)

  if (!product) notFound()

  const relatedProducts = getRelatedProducts(product)
  const { addItem, openCart } = useCart()

  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0])
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0])
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor)
    openCart()
  }

  const categoryLabel: Record<string, string> = {
    Babies: "Bebés",
    Girls: "Niñas",
    Boys: "Niños",
    Essentials: "Esenciales",
    Sales: "Ofertas",
  }

  const categoryHref = product.category
    ? `${routes.categoryBase}/${product.category.toLowerCase()}`
    : routes.products

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav aria-label="Ruta de navegación" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            <li>
              <Link href={routes.home} className="hover:text-brand-base transition-colors">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3 h-3" />
            </li>
            <li>
              <Link href={routes.products} className="hover:text-brand-base transition-colors">
                Productos
              </Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden="true">
                  <ChevronRight className="w-3 h-3" />
                </li>
                <li>
                  <Link href={categoryHref} className="hover:text-brand-base transition-colors">
                    {categoryLabel[product.category] ?? product.category}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">
              <ChevronRight className="w-3 h-3" />
            </li>
            <li className="text-brand-ink font-medium truncate max-w-[200px]" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Main product grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Image */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-surface shadow-sm border border-border">
            {product.isNew && (
              <Badge variant="new" className="absolute top-4 left-4 z-10">
                Nuevo
              </Badge>
            )}
            {product.isOnSale && discountPct > 0 && (
              <Badge variant="discount" className="absolute top-4 left-4 z-10">
                -{discountPct}%
              </Badge>
            )}
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5 py-2">
            {product.category && (
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {categoryLabel[product.category] ?? product.category}
              </p>
            )}

            <h1 className="font-display font-bold text-2xl md:text-3xl text-brand-ink leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating !== undefined && product.reviewCount !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex" aria-label={`${product.rating} de 5 estrellas`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.floor(product.rating!)
                          ? "text-brand-base fill-brand-base"
                          : "text-brand-muted",
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reseñas)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-bold text-3xl text-brand-ink">
                {locale.currencySymbol}
                {product.price.toLocaleString(locale.dateLocale)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {locale.currencySymbol}
                  {product.originalPrice.toLocaleString(locale.dateLocale)}
                </span>
              )}
              {discountPct > 0 && (
                <span className="text-sm font-semibold text-green-600">
                  Ahorras {locale.currencySymbol}
                  {(product.originalPrice! - product.price).toLocaleString(locale.dateLocale)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Color selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-brand-ink mb-2">
                  Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Color ${color}`}
                      aria-pressed={selectedColor === color}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        selectedColor === color
                          ? "border-brand-base scale-110 shadow-md"
                          : "border-border hover:border-brand-muted",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-brand-ink mb-2">
                  Talla: <span className="font-normal text-muted-foreground">{selectedSize}</span>
                </p>
                <div className="flex gap-2 flex-wrap" role="group" aria-label="Seleccionar talla">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-lg border-2 font-medium transition-all",
                        selectedSize === size
                          ? "border-brand-base bg-brand-base text-brand-on-base"
                          : "border-border text-foreground hover:border-brand-muted bg-background",
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-brand-ink mb-2">Cantidad</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Disminuir cantidad"
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-lg font-medium hover:bg-brand-surface-alt transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-brand-ink" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Aumentar cantidad"
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-lg font-medium hover:bg-brand-surface-alt transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 pt-1">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" />
                Agregar al carrito
              </Button>
              <button
                onClick={() => setIsFavorite((f) => !f)}
                aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                aria-pressed={isFavorite}
                className={cn(
                  "w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all",
                  isFavorite
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-border text-muted-foreground hover:border-red-300 hover:text-red-400",
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-red-500")} aria-hidden="true" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="w-5 h-5 text-brand-base" aria-hidden="true" />
                <p className="text-xs text-muted-foreground leading-tight">
                  Gratis desde{" "}
                  <span className="font-medium text-brand-ink">
                    {locale.currencySymbol}
                    {shipping.freeThreshold.toLocaleString(locale.dateLocale)}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="w-5 h-5 text-brand-base" aria-hidden="true" />
                <p className="text-xs text-muted-foreground leading-tight">
                  Pago seguro garantizado
                </p>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RotateCcw className="w-5 h-5 text-brand-base" aria-hidden="true" />
                <p className="text-xs text-muted-foreground leading-tight">
                  Devoluciones en {shipping.estimatedDays}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-20" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="font-display font-bold text-2xl text-brand-ink mb-8"
            >
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
