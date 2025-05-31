"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Eye, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
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
}

export function ProductCard({ product }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    console.log("Toggle wishlist para:", product.id)
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discountPercentage || 0

  return (
    <div
      className="group relative bg-card text-card-foreground rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-offWhite" style={{ position: 'relative' }}>
        {!isImageLoaded && <div className="absolute inset-0 bg-brand-silver animate-pulse" />}
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          priority={true}
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
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all duration-200",
            "bg-background/80 backdrop-blur-sm hover:bg-background text-foreground",
            "opacity-0 group-hover:opacity-100",
            isFavorite && "opacity-100",
          )}
        >
          <Heart className={cn("w-4 h-4", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
        </button>
        <div
          className={cn(
            "absolute inset-0 bg-brand-charcoal/20 flex items-center justify-center transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <Button variant="secondary" size="sm" onClick={() => console.log("Quick view:", product.id)}>
            <Eye className="w-4 h-4 mr-2" /> Vista rápida
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {product.category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{product.category}</p>
        )}
        <h3 className="font-montserrat font-semibold text-foreground line-clamp-2 leading-tight h-10">
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
                      ? "text-brand-goldenYellow fill-brand-goldenYellow"
                      : "text-brand-taupe",
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
                  className="text-xs px-1.5 py-0.5 bg-brand-offWhite rounded text-foreground border border-brand-taupe/50"
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
