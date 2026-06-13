"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Clock, XCircle } from "lucide-react"
import type { PaymentStatus } from "@prisma/client"
import { useCart } from "@/hooks/use-cart"

interface PaymentStatusPollerProps {
  orderId: string
  initialStatus: PaymentStatus
  orderNumber: string
  customerEmail: string | null
}

const POLL_INTERVAL_MS = 5000
const MAX_POLLS = 60

const isSettled = (status: PaymentStatus) => status === "PAID" || status === "FAILED"

/**
 * Shows the live payment state on the order confirmation page. A PSE payment can
 * settle seconds after the customer returns from the bank, so while the order is
 * pending we poll the order endpoint and transition the UI in place — no full
 * reload — until it settles or we give up and point the customer to their email.
 */
export function PaymentStatusPoller({
  orderId,
  initialStatus,
  orderNumber,
  customerEmail,
}: PaymentStatusPollerProps) {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus)
  const [gaveUp, setGaveUp] = useState(false)
  const { clearCart } = useCart()
  const clearedRef = useRef(false)

  useEffect(() => {
    if (status === "PAID" && !clearedRef.current) {
      clearedRef.current = true
      clearCart()
    }
  }, [status, clearCart])

  useEffect(() => {
    if (isSettled(initialStatus)) return

    let polls = 0
    const interval = setInterval(async () => {
      polls += 1
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (res.ok) {
          const order: { paymentStatus: PaymentStatus } = await res.json()
          if (isSettled(order.paymentStatus)) {
            setStatus(order.paymentStatus)
            clearInterval(interval)
            return
          }
        }
      } catch {
        // Transient network error — keep polling until the attempt budget runs out.
      }
      if (polls >= MAX_POLLS) {
        setGaveUp(true)
        clearInterval(interval)
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [orderId, initialStatus])

  const emailSuffix = customerEmail ? ` a ${customerEmail}` : ""

  if (status === "PAID") {
    return (
      <header className="text-center mb-10">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-brand-base/10">
          <CheckCircle2 className="h-9 w-9 text-brand-base" aria-hidden="true" />
        </div>
        <h1 className="font-display font-bold text-3xl text-brand-ink">¡Gracias por tu compra!</h1>
        <p className="text-brand-muted mt-2">
          Tu pedido <span className="font-semibold text-brand-ink">{orderNumber}</span> fue
          recibido. Te enviaremos un correo con los detalles{emailSuffix}.
        </p>
      </header>
    )
  }

  if (status === "FAILED") {
    return (
      <header className="text-center mb-10">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-destructive/10">
          <XCircle className="h-9 w-9 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="font-display font-bold text-3xl text-brand-ink">El pago no se completó</h1>
        <p className="text-brand-muted mt-2">
          No se realizó ningún cargo en tu pedido{" "}
          <span className="font-semibold text-brand-ink">{orderNumber}</span>. Puedes intentar el
          pago de nuevo.
        </p>
        <Link
          href={`/pago-fallido?orderId=${orderId}`}
          className="inline-block mt-6 px-6 py-3 rounded-xl bg-brand-base text-brand-on-base font-semibold hover:opacity-90 transition-opacity"
        >
          Intentar de nuevo
        </Link>
      </header>
    )
  }

  return (
    <header className="text-center mb-10">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-amber-100">
        <Clock className="h-9 w-9 text-amber-600" aria-hidden="true" />
      </div>
      <h1 className="font-display font-bold text-3xl text-brand-ink">Tu pago está en proceso</h1>
      <p className="text-brand-muted mt-2">
        Recibimos tu pedido <span className="font-semibold text-brand-ink">{orderNumber}</span> y
        estamos esperando la confirmación del pago.{" "}
        {gaveUp
          ? `Verifica tu correo${emailSuffix} para la confirmación del banco.`
          : `Te avisaremos por correo${emailSuffix} apenas se confirme — no necesitas hacer nada más.`}
      </p>
    </header>
  )
}
