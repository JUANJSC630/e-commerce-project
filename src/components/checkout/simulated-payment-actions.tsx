"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"

interface SimulatedPaymentActionsProps {
  orderId: string
  successHref: string
}

/**
 * Buttons that stand in for the payment gateway's outcome. On approval the cart
 * is cleared and the customer lands on the success page; on rejection the order
 * is cancelled (stock restored server-side) and the cart is preserved so they
 * can retry.
 */
export function SimulatedPaymentActions({ orderId, successHref }: SimulatedPaymentActionsProps) {
  const router = useRouter()
  const { clearCart } = useCart()
  const [pending, setPending] = useState<"approved" | "rejected" | null>(null)

  const settle = async (outcome: "approved" | "rejected") => {
    if (pending) return
    setPending(outcome)
    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, outcome }),
      })
      if (!res.ok) throw new Error("settle failed")

      if (outcome === "approved") {
        clearCart()
        router.push(successHref)
      } else {
        router.push("/pago-fallido")
      }
    } catch {
      toast.error("No se pudo procesar el pago. Intenta de nuevo.")
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button size="lg" onClick={() => settle("approved")} disabled={pending !== null}>
        <Check className="w-4 h-4 mr-2" aria-hidden="true" />
        {pending === "approved" ? "Procesando…" : "Simular pago aprobado"}
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => settle("rejected")}
        disabled={pending !== null}
      >
        <X className="w-4 h-4 mr-2" aria-hidden="true" />
        {pending === "rejected" ? "Procesando…" : "Simular pago rechazado"}
      </Button>
    </div>
  )
}
