"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, Trash2, Tag, X } from "lucide-react"
import { toast } from "sonner"
import { useSettings, useFormatPrice } from "@/components/providers/settings-provider"
import { resolveShippingCost, computeTax } from "@/lib/shipping"
import type { CartItem } from "@/lib/types"

// Modified item type that uses size and color instead of selectedSize and selectedColor
interface CartSummaryItem extends Omit<CartItem, "selectedSize" | "selectedColor"> {
  size?: string
  color?: string
}

/** A discount the customer applied at checkout (validated server-side). */
export interface AppliedDiscount {
  code: string
  amount: number
  freeShipping: boolean
}

interface CartSummaryProps {
  items: CartSummaryItem[]
  onUpdateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
  onRemoveItem: (id: string, size?: string, color?: string) => void
  isEditable?: boolean
  /** When true, shows the discount-code field and surfaces the applied code. */
  enableDiscount?: boolean
  discount?: AppliedDiscount | null
  onDiscountChange?: (discount: AppliedDiscount | null) => void
  /** Destination state (departamento) — picks the shipping zone rate when known. */
  state?: string
}

export function CartSummary({
  items,
  onUpdateQuantity,
  onRemoveItem,
  isEditable = true,
  enableDiscount = false,
  discount = null,
  onDiscountChange,
  state,
}: CartSummaryProps) {
  const { shipping } = useSettings()
  const formatPrice = useFormatPrice()
  const [code, setCode] = useState("")
  const [applying, setApplying] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const baseShipping = resolveShippingCost(subtotal, state, shipping)
  const freeShipping = discount?.freeShipping ?? false
  const shippingCost = freeShipping ? 0 : baseShipping
  // Free-shipping codes zero the shipping line; others take an amount off subtotal.
  const discountValue = discount && !discount.freeShipping ? discount.amount : 0
  // IVA on the post-discount goods (mirrors the server). Included tax stays inside
  // the total; added tax bumps it.
  const tax = computeTax(subtotal - discountValue, shipping)
  const total = subtotal + shippingCost - discountValue + (tax.included ? 0 : tax.amount)

  async function applyDiscount() {
    if (!code.trim()) return
    setApplying(true)
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      })
      const data = await res.json()
      if (!data.ok) {
        toast.error(data.message ?? "Código inválido")
        return
      }
      onDiscountChange?.({ code: data.code, amount: data.amount, freeShipping: data.freeShipping })
      setCode("")
      toast.success("Código aplicado")
    } finally {
      setApplying(false)
    }
  }

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
              <p className="font-semibold text-sm">{formatPrice(item.price)}</p>
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
                <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      {enableDiscount && (
        <div className="border-t border-border pt-4 mb-2">
          {discount ? (
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-green-700">
                <Tag className="w-3.5 h-3.5" />
                {discount.code}
              </span>
              <button
                type="button"
                onClick={() => onDiscountChange?.(null)}
                aria-label="Quitar código"
                className="text-green-700 hover:text-green-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    applyDiscount()
                  }
                }}
                placeholder="Código de descuento"
                className="flex-1 px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-brand-base/40"
              />
              <button
                type="button"
                onClick={applyDiscount}
                disabled={applying || !code.trim()}
                className="px-4 py-2 rounded-lg border border-brand-base text-brand-base text-sm font-medium hover:bg-brand-base hover:text-brand-on-base transition-colors disabled:opacity-50"
              >
                {applying ? "…" : "Aplicar"}
              </button>
            </div>
          )}
        </div>
      )}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        {discountValue > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Descuento ({discount?.code})</span>
            <span className="font-medium">−{formatPrice(discountValue)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-medium">
            {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
          </span>
        </div>
        {shippingCost === 0 && !freeShipping && (
          <p className="text-xs text-green-600">
            ¡Envío gratis por compras superiores a {formatPrice(shipping.freeThreshold)}!
          </p>
        )}
        {freeShipping && <p className="text-xs text-green-600">¡Envío gratis con tu código!</p>}
        {tax.amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              IVA {shipping.taxRate ? `(${shipping.taxRate}%)` : ""}
              {tax.included ? " incluido" : ""}
            </span>
            <span className="font-medium">{formatPrice(tax.amount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-brand-base">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
