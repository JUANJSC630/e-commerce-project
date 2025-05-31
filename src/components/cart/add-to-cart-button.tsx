"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image: string
  }
  className?: string
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    setIsLoading(true)
    // Simulate adding to cart
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    alert(`Agregado ${product.name} al carrito!`)
  }

  return (
    <Button className={className} onClick={handleAddToCart} disabled={isLoading}>
      {isLoading ? (
        "Agregando..."
      ) : (
        <>
          Agregar al carrito
          <ShoppingCart className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  )
}
