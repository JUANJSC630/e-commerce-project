"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { routes } from "@/config/store.config"
import { useSettings, useFormatPrice } from "@/components/providers/settings-provider"

interface CartItemSummary {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartSummaryProps {
  items: CartItemSummary[]
}

export function CartSummary({ items }: CartSummaryProps) {
  const { shipping } = useSettings()
  const formatPrice = useFormatPrice()
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = subtotal > shipping.freeThreshold ? 0 : shipping.standardCost
  const total = subtotal + shippingCost

  return (
    <div className="bg-brand-surface-alt rounded-2xl p-6 text-brand-ink sticky top-28">
      <h3 className="font-display font-semibold text-xl mb-6">Resumen del pedido</h3>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-brand-muted">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-muted">Envío estimado</span>
          <span className="font-medium">
            {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="border-t border-brand-muted/30 pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-brand-base">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
      <Button asChild size="lg" className="w-full">
        <Link href={routes.checkout}>Proceder al pago</Link>
      </Button>
      <div className="mt-4 text-xs text-brand-muted text-center">
        <p>
          Política de devoluciones flexible.{" "}
          <Link href={routes.policies} className="underline hover:text-brand-base">
            Leer más
          </Link>
        </p>
      </div>
    </div>
  )
}
