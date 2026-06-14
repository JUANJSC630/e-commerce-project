"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import type { Product } from "@/lib/types"

interface AddToCartButtonProps {
  product: Product
  className?: string
}

/**
 * Quick-add used on product cards. Adds a single unit with the product's first
 * available size/color as defaults. The cart provider handles the toast and
 * opening the mini-cart, so this stays a thin trigger.
 */
export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product, 1, product.sizes?.[0], product.colors?.[0])
  }

  return (
    <Button className={cn("btn-cta", className)} onClick={handleAddToCart}>
      Agregar al carrito
      <ShoppingCart className="w-4 h-4 ml-2" />
    </Button>
  )
}
