"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"

export function CartCounter() {
  const { getItemCount, toggleCart } = useCart()
  const itemCount = getItemCount()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-brand-charcoal hover:bg-brand-taupe/20"
      onClick={toggleCart}
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-goldenYellow text-xs font-bold text-brand-charcoal">
          {itemCount}
        </span>
      )}
      <span className="sr-only">Ver carrito</span>
    </Button>
  )
}
