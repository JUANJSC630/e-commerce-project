"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Eye, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    images?: string[]
    rating?: number
    reviewCount?: number
    sizes?: string[]
    colors?: string[]
    isNew?: boolean
    isOnSale?: boolean
    discountPercentage?: number
    category?: string
  }
  /** Only set true for above-the-fold cards (first 3-4 visible on load) */
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discountPercentage || 0

  return (
    <div
      className="group relative bg-card text-card-foreground rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-border"
    >
      <Link
        href={`/products/${product.id}`}
        className="block relative aspect-[3/4] overflow-hidden bg-brand-surface"
        aria-label={`Ver detalles de ${product.name}`}
        tabIndex={0}
      >
        {!isImageLoaded && <div className="absolute inset-0 bg-brand-surface-alt animate-pulse" />}
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
          {product.isOnSale && discountPercentage > 0 && <Badge variant="discount">-{discountPercentage}%</Badge>}
        </div>
        <button
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={isFavorite}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all duration-200",
            "bg-background/80 backdrop-blur-sm hover:bg-background text-foreground",
            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            isFavorite && "opacity-100",
          )}
        >
          <Heart className={cn("w-4 h-4", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
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
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{product.category}</p>
        )}
        <h3 className="font-display font-semibold text-foreground line-clamp-2 leading-tight h-10">
          {product.name}
        </h3>
        {product.rating !== undefined && product.reviewCount !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(product.rating!)
                      ? "text-brand-base fill-brand-base"
                      : "text-brand-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-lg text-foreground">${product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice.toLocaleString()}
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
              {product.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-muted-foreground">+{product.colors.length - 3}</span>
              )}
            </div>
          </div>
        )}
        <AddToCartButton product={product} className="w-full mt-4 font-medium" />
      </div>
    </div>
  )
}
