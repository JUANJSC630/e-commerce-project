// Este componente ya existe de la implementación anterior del checkout.
// Lo adaptaremos ligeramente si es necesario para la página del carrito.
// Por ahora, asumimos que su estructura es adecuada.
// Asegúrate que los colores coincidan con la paleta "Modern Yellow".
// Por ejemplo, el total destacado debería usar `text-brand-goldenYellow`.
// El fondo podría ser `bg-brand-silver/30` o `bg-card`.
"use client"
import { Button } from "@/components/ui/button" // Asegúrate que Button está importado
import Link from "next/link" // Para el botón de checkout

interface CartItemSummary {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartSummaryProps {
  items: CartItemSummary[]
  // Podríamos añadir props para cupones, envío, etc.
}

export function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 150000 ? 0 : 10000 // Ejemplo: envío gratis sobre $150.000
  const total = subtotal + shipping

  return (
    <div className="bg-brand-silver/30 rounded-2xl p-6 text-brand-charcoal sticky top-28">
      <h3 className="font-montserrat font-semibold text-xl mb-6">Resumen del Pedido</h3>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-brand-taupe">Subtotal</span>
          <span className="font-medium">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-taupe">Envío Estimado</span>
          <span className="font-medium">{shipping === 0 ? "Gratis" : `$${shipping.toLocaleString()}`}</span>
        </div>
        {/* Aquí iría el campo para cupón de descuento */}
        <div className="border-t border-brand-taupe/50 pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-brand-goldenYellow">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <Button asChild size="lg" className="w-full">
        <Link href="/checkout-flow">Proceder al Pago</Link>
      </Button>
      <div className="mt-4 text-xs text-brand-taupe text-center">
        <p>
          Políticas de devolución flexibles.{" "}
          <Link href="/politicas" className="underline hover:text-brand-goldenYellow">
            Leer más
          </Link>
        </p>
      </div>
    </div>
  )
}
