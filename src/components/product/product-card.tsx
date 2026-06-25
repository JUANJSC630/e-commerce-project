"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Heart, Eye, Star, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { StockBadge } from "@/components/product/stock-badge"
import { useFavorites } from "@/hooks/use-favorites"
import { useCart } from "@/hooks/use-cart"
import { isOutOfStock } from "@/lib/inventory"
import { useFormatPrice } from "@/components/providers/settings-provider"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  /** Set true only for above-the-fold cards (first 3–4 visible on load) */
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const formatPrice = useFormatPrice()
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites(product.id)
  const { addItem } = useCart()

  // Quick-add only when there's nothing to choose: no variants, sizes or colors,
  // and stock available. Anything else routes to the detail page to pick options.
  const outOfStock = isOutOfStock(product.stock)
  const needsSelection =
    (product.variants?.length ?? 0) > 0 ||
    (product.sizes?.length ?? 0) > 0 ||
    (product.colors?.length ?? 0) > 0
  const canQuickAdd = !needsSelection && !outOfStock

  const handleQuickAdd = () => {
    addItem(product, 1)
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // First gallery photo distinct from the cover - revealed on hover (E.3).
  const hoverImage = product.images?.find((img) => img.url && img.url !== product.image)?.url

  return (
    <div className="group relative bg-card text-card-foreground rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-border">
      <Link
        href={`/products/${product.id}`}
        className="block relative aspect-[3/4] overflow-hidden bg-brand-surface"
        aria-label={`Ver detalles de ${product.name}`}
      >
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-brand-surface-alt animate-pulse" aria-hidden="true" />
        )}
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.imageAlt || product.name}
          fill
          priority={priority}
          className={cn(
            "object-cover transition-all duration-500 group-hover:scale-105",
            isImageLoaded ? "opacity-100" : "opacity-0",
            // Fade the cover out on hover when a swap image is available.
            hoverImage && "group-hover:opacity-0",
          )}
          onLoad={() => setIsImageLoaded(true)}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt=""
            aria-hidden="true"
            fill
            className="object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && <Badge variant="new">Nuevo</Badge>}
          {/* Show the % off whenever there's a real saving (mirrors the strike-through price). */}
          {discountPercentage > 0 && <Badge variant="discount">-{discountPercentage}%</Badge>}
          <StockBadge stock={product.stock} />
        </div>

        <button
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={isFavorite}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all duration-200",
            "bg-background/80 backdrop-blur-sm hover:bg-background text-foreground",
            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            isFavorite && "opacity-100",
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4",
              isFavorite ? "fill-brand-base text-brand-base" : "text-muted-foreground",
            )}
          />
        </button>

        <div
          className={cn(
            "absolute inset-0 bg-brand-ink/20 flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto",
            "transition-opacity duration-300",
          )}
          aria-hidden="true"
        >
          <span className="flex items-center gap-1.5 bg-background/90 text-foreground text-sm font-medium px-3 py-1.5 rounded-full">
            <Eye className="w-4 h-4" aria-hidden="true" /> Ver producto
          </span>
        </div>
      </Link>

      <div className="p-3.5 space-y-2.5">
        {product.category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {product.category.name}
          </p>
        )}

        <h3 className="font-display font-semibold text-foreground line-clamp-2 leading-tight h-10">
          {product.name}
        </h3>

        {product.rating !== undefined && product.reviewCount !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex items-center" aria-label={`${product.rating} de 5 estrellas`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(product.rating!)
                      ? "text-brand-base fill-brand-base"
                      : "text-brand-muted",
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="font-bold text-lg text-foreground">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Tallas:</span>
            <div className="flex gap-1 flex-wrap">
              {product.sizes.slice(0, 3).map((size) => (
                <span
                  key={size}
                  className="text-xs px-1.5 py-0.5 bg-brand-surface rounded text-foreground border border-brand-muted/50"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-xs text-muted-foreground">+{product.sizes.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Colores:</span>
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color, i) => (
                <div
                  key={`${color}-${i}`}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                  title={color}
                  aria-hidden="true"
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-muted-foreground">+{product.colors.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {canQuickAdd ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="btn-cta mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Agregar al carrito
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <Link
            href={`/products/${product.id}`}
            className="btn-cta mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {outOfStock ? "Ver producto" : needsSelection ? "Elegir opciones" : "Ver producto"}
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  )
}
