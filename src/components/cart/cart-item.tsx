"use client"

import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuantitySelector } from "./quantity-selector"
import { useCart } from "@/hooks/use-cart"
import type { CartItem as CartItemType } from "@/lib/types"

interface CartItemProps {
  item: CartItemType
  isMiniCart?: boolean
}

export function CartItem({ item, isMiniCart = false }: CartItemProps) {
  const { removeItem, updateItemQuantity } = useCart()

  return (
    <div
      className={`flex gap-3 ${isMiniCart ? "py-3" : "py-4 border-b border-brand-muted/50"} last:border-b-0`}
    >
      <div
        className={`relative ${isMiniCart ? "w-16 h-16" : "w-24 h-24 md:w-32 md:h-32"} rounded-md overflow-hidden bg-brand-surface-alt/50`}
        style={{ position: "relative" }}
      >
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          className="object-cover"
          sizes={isMiniCart ? "64px" : "128px"}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/producto/${item.id}`} passHref>
            <h3
              className={`font-semibold ${isMiniCart ? "text-sm" : "text-base"} text-brand-ink hover:text-brand-base line-clamp-2`}
            >
              {item.name}
            </h3>
          </Link>
          {(item.selectedSize || item.selectedColor) && (
            <p className="text-xs text-brand-muted">
              {item.selectedSize && `Talla: ${item.selectedSize}`}
              {item.selectedSize && item.selectedColor && " • "}
              {item.selectedColor && `Color: ${item.selectedColor}`}
            </p>
          )}
          <p className={`font-medium ${isMiniCart ? "text-xs" : "text-sm"} text-brand-ink`}>
            ${item.price.toLocaleString()}
          </p>
        </div>
        {!isMiniCart && (
          <p className="font-semibold text-sm text-brand-ink">
            Subtotal: ${(item.price * item.quantity).toLocaleString()}
          </p>
        )}
      </div>
      <div
        className={`flex ${isMiniCart ? "flex-col items-end justify-between" : "flex-col items-end justify-start md:flex-row md:items-center md:justify-end"} gap-2`}
      >
        <QuantitySelector
          quantity={item.quantity}
          onDecrease={() =>
            updateItemQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)
          }
          onIncrease={() =>
            updateItemQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)
          }
        />
        {isMiniCart && (
          <p className="text-sm font-semibold text-brand-ink mt-1">
            ${(item.price * item.quantity).toLocaleString()}
          </p>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`text-brand-muted hover:text-destructive ${isMiniCart ? "h-7 w-7" : "h-8 w-8"}`}
          onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
