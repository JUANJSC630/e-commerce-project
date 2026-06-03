"use client"

import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem } from "@/lib/types"

// Modified item type that uses size and color instead of selectedSize and selectedColor
interface CartSummaryItem extends Omit<CartItem, "selectedSize" | "selectedColor"> {
  size?: string
  color?: string
}

interface CartSummaryProps {
  items: CartSummaryItem[]
  onUpdateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
  onRemoveItem: (id: string, size?: string, color?: string) => void
  isEditable?: boolean
}

export function CartSummary({
  items,
  onUpdateQuantity,
  onRemoveItem,
  isEditable = true,
}: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50000 ? 0 : 5000
  const total = subtotal + shipping

  return (
    <div className="bg-brand-surface-alt/50 rounded-2xl p-6 text-foreground">
      {" "}
      {/* Fondo Silver claro */}
      <h3 className="font-display font-semibold text-lg mb-4">Resumen del pedido</h3>
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
            <div
              className="relative w-16 h-16 rounded-lg overflow-hidden bg-brand-surface"
              style={{ position: "relative" }}
            >
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              <p className="text-xs text-muted-foreground">
                Talla: {item.size || "Única"} • Color: {item.color || "Estándar"}
              </p>
              <p className="font-semibold text-sm">${item.price.toLocaleString()}</p>
            </div>
            {isEditable ? (
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => onRemoveItem(item.id, item.size, item.color)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.id,
                        Math.max(1, item.quantity - 1),
                        item.size,
                        item.color,
                      )
                    }
                    className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:border-brand-base transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.id, item.quantity + 1, item.size, item.color)
                    }
                    className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:border-brand-base transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Cant: {item.quantity}</p>
                <p className="font-semibold text-sm">
                  ${(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-medium">
            {shipping === 0 ? "Gratis" : `$${shipping.toLocaleString()}`}
          </span>
        </div>
        {shipping === 0 && (
          <p className="text-xs text-green-600">¡Envío gratis por compras superiores a $50.000!</p>
        )}
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-brand-base">${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
