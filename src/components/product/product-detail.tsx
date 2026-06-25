"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
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
import { ProductCard } from "@/components/product/product-card"
import { ProductGallery } from "@/components/product/product-gallery"
import { StockBadge } from "@/components/product/stock-badge"
import { StockAlertForm } from "@/components/product/stock-alert-form"
import { SizeGuideModal } from "@/components/product/size-guide-modal"
import { isOutOfStock } from "@/lib/inventory"
import { useCart } from "@/hooks/use-cart"
import { useFavorites } from "@/hooks/use-favorites"
import { routes } from "@/config/store.config"
import { useSettings } from "@/components/providers/settings-provider"
import { trackViewItem } from "@/lib/analytics"
import type { Product } from "@/lib/types"

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

/** Distinct values preserving first-seen order. */
function uniq<T>(values: T[]): T[] {
  return [...new Set(values)]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const { locale, shipping } = useSettings()
  const { addItem, openCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites(product.id)

  const hasVariants = (product.variants?.length ?? 0) > 0

  // Option lists come from the variants when present, else the loose arrays.
  const sizeOptions = useMemo(
    () =>
      hasVariants
        ? uniq(product.variants!.map((v) => v.size).filter((s): s is string => Boolean(s)))
        : (product.sizes ?? []),
    [product, hasVariants],
  )
  const colorOptions = useMemo(
    () =>
      hasVariants
        ? uniq(product.variants!.map((v) => v.color).filter((c): c is string => Boolean(c)))
        : (product.colors ?? []),
    [product, hasVariants],
  )

  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizeOptions[0])
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colorOptions[0])
  const [quantity, setQuantity] = useState(1)

  // The variant matching the current size+color, when the product has variants.
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return undefined
    return product.variants!.find(
      (v) => (v.size ?? undefined) === selectedSize && (v.color ?? undefined) === selectedColor,
    )
  }, [product, hasVariants, selectedSize, selectedColor])

  const effectivePrice = selectedVariant?.price ?? product.price
  const effectiveStock = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock
  const outOfStock = isOutOfStock(effectiveStock)
  // Preorder products can be bought past zero stock (backorder).
  const canPreorder = product.isPreorder === true
  const blocked = outOfStock && !canPreorder
  // With variants, a valid combo must be picked before adding to the cart.
  const mustSelectVariant = hasVariants && !selectedVariant

  // Cover first, then the ordered gallery (deduped by URL). Falls back to a
  // single image when the product has no extra photos.
  const gallery = useMemo(() => {
    const cover = {
      url: product.image || "/placeholder.svg",
      alt: product.imageAlt || product.name,
    }
    const extra = (product.images ?? [])
      .filter((img) => img.url && img.url !== cover.url)
      .map((img) => ({ url: img.url, alt: img.alt || product.name }))
    return [cover, ...extra]
  }, [product])
  const [activeImage, setActiveImage] = useState(0)
  // A selected variant with its own photo overrides the gallery selection.
  const active = selectedVariant?.imageUrl
    ? { url: selectedVariant.imageUrl, alt: product.name }
    : (gallery[activeImage] ?? gallery[0])

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // Fire view_item once per product view.
  useEffect(() => {
    trackViewItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category?.name,
    })
  }, [product.id, product.name, product.price, product.category?.name])

  const handleAddToCart = () => {
    if (blocked || mustSelectVariant) return
    // Carry the variant's price + image on the cart line so totals are correct.
    const cartProduct = selectedVariant
      ? { ...product, price: effectivePrice, image: selectedVariant.imageUrl || product.image }
      : product
    addItem(cartProduct, quantity, selectedSize, selectedColor, selectedVariant?.id)
    openCart()
  }

  const categoryHref = product.category
    ? `${routes.categoryBase}/${product.category.slug}`
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
                    {product.category.name}
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

        {/* Main product grid — compact gallery column (hover-zoom + expand) so
            low-res photos don't upscale into blur; info column takes the rest. */}
        <div className="grid md:grid-cols-[16rem_1fr] gap-8 lg:gap-14 items-start">
          {/* Gallery */}
          <div className="w-full md:max-w-[16rem] mx-auto md:mx-0 md:sticky md:top-24">
            <ProductGallery
              images={gallery}
              activeIndex={activeImage}
              onSelect={setActiveImage}
              displayUrl={active.url}
              displayAlt={active.alt}
              badges={
                <>
                  {product.isNew && (
                    <Badge variant="new" className="absolute top-4 left-4 z-10">
                      Nuevo
                    </Badge>
                  )}
                  {discountPct > 0 && (
                    <Badge variant="discount" className="absolute top-4 left-4 z-10">
                      -{discountPct}%
                    </Badge>
                  )}
                </>
              }
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5 py-2">
            {product.category && (
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {product.category.name}
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
                {effectivePrice.toLocaleString(locale.dateLocale)}
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

            <StockBadge stock={effectiveStock} />

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Color selector */}
            {colorOptions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-brand-ink mb-2">
                  Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
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
            {sizeOptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-brand-ink">
                    Talla: <span className="font-normal text-muted-foreground">{selectedSize}</span>
                  </p>
                  <SizeGuideModal />
                </div>
                <div className="flex gap-2 flex-wrap" role="group" aria-label="Seleccionar talla">
                  {sizeOptions.map((size) => (
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
              <Button
                size="lg"
                className="btn-cta flex-1"
                onClick={handleAddToCart}
                disabled={blocked || mustSelectVariant}
              >
                <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" />
                {mustSelectVariant
                  ? "Selecciona talla y color"
                  : blocked
                    ? "Agotado"
                    : outOfStock && canPreorder
                      ? "Reservar (preventa)"
                      : "Agregar al carrito"}
              </Button>
              <button
                onClick={toggleFavorite}
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

            {/* Preorder note, or back-in-stock alert for plain out-of-stock items */}
            {outOfStock && canPreorder && (
              <p className="text-sm text-brand-base font-medium">
                Producto en preventa: resérvalo ahora y te lo enviamos cuando llegue.
              </p>
            )}
            {blocked && <StockAlertForm productId={product.id} />}

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
