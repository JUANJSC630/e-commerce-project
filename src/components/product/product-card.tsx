"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Heart, Eye, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { StockBadge } from "@/components/product/stock-badge"
import { isOutOfStock } from "@/lib/inventory"
import { useFavorites } from "@/hooks/use-favorites"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  /** Set true only for above-the-fold cards (first 3–4 visible on load) */
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites(product.id)

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const outOfStock = isOutOfStock(product.stock)

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
          alt={product.name}
          fill
          priority={priority}
          className={cn(
            "object-cover transition-all duration-500 group-hover:scale-105",
            isImageLoaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setIsImageLoaded(true)}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && <Badge variant="new">Nuevo</Badge>}
          {product.isOnSale && discountPercentage > 0 && (
            <Badge variant="discount">-{discountPercentage}%</Badge>
          )}
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

      <div className="p-4 space-y-3">
        {product.category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {product.category}
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

        {outOfStock ? (
          <Button disabled className="w-full mt-4 font-medium">
            Agotado
          </Button>
        ) : (
          <AddToCartButton product={product} className="w-full mt-4 font-medium" />
        )}
      </div>
    </div>
  )
}
