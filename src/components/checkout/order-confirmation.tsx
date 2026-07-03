"use client"

import { useState, useEffect } from "react"
import { Check, MapPin, CreditCard, Truck, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/store.config"
import { useSettings, useFormatPrice } from "@/components/providers/settings-provider"

interface OrderConfirmationProps {
  orderData: {
    shipping: {
      firstName: string
      lastName: string
      address: string
      city: string
      phone: string
      email: string
    }
    payment: {
      method: string
    }
    items: {
      id: string | number
      name: string
      size: string
      color: string
      quantity: number
      price: number
    }[]
  }
  onConfirm: () => void | Promise<void>
  onBack: () => void
}

// Simplified validation just for final confirmation
const validateOrderData = (orderData: OrderConfirmationProps["orderData"]) => {
  const { shipping, payment, items } = orderData

  // Check if we have all required shipping fields
  const requiredShippingFields = ["firstName", "lastName", "email", "address", "city"]
  const shippingValid = requiredShippingFields.every(
    (field) => shipping[field as keyof typeof shipping]?.toString().trim() !== "",
  )

  // Check if we have a payment method
  const paymentValid = !!payment.method

  // Check if we have items
  const itemsValid = items && items.length > 0

  return {
    isValid: shippingValid && paymentValid && itemsValid,
    shippingValid,
    paymentValid,
    itemsValid,
  }
}

export function OrderConfirmation({ orderData, onConfirm, onBack }: OrderConfirmationProps) {
  const { shipping } = useSettings()
  const formatPrice = useFormatPrice()
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationState, setValidationState] = useState({ isValid: true, message: "" })

  // Validate data when component mounts
  useEffect(() => {
    const validationResult = validateOrderData(orderData)
    setValidationState({
      isValid: validationResult.isValid,
      message: !validationResult.isValid
        ? "Por favor revisa los datos antes de confirmar tu pedido."
        : "",
    })
  }, [orderData])

  const handleConfirm = async () => {
    // Final validation before processing the order
    const validationResult = validateOrderData(orderData)

    if (!validationResult.isValid) {
      setValidationState({
        isValid: false,
        message: "Por favor revisa los datos antes de confirmar tu pedido.",
      })
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    setIsProcessing(true)
    try {
      await onConfirm()
    } finally {
      setIsProcessing(false)
    }
  }

  const { shipping: ship, payment, items } = orderData
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = subtotal > shipping.freeThreshold ? 0 : shipping.standardCost
  const total = subtotal + shippingCost
  const paymentLabel =
    payment.method === "pse" ? "PSE · Transferencia bancaria" : "Tarjeta de crédito o débito"

  return (
    <div className="max-w-2xl text-foreground">
      <h2 className="font-display font-semibold text-xl mb-6">Confirmar pedido</h2>

      {!validationState.isValid && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6">
          <p className="font-medium">{validationState.message}</p>
          <p className="text-sm mt-1">
            Regresa a los pasos anteriores para completar la información requerida.
          </p>
        </div>
      )}

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-4">
            <header className="mb-3 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-base/10 text-brand-base">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-brand-ink">Envío a</h3>
            </header>
            <div className="text-sm leading-relaxed text-brand-muted">
              <p className="font-medium text-brand-ink">
                {ship.firstName} {ship.lastName}
              </p>
              <p>{ship.address}</p>
              <p>{ship.city}</p>
              {ship.phone && <p>{ship.phone}</p>}
              {ship.email && <p className="truncate">{ship.email}</p>}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <header className="mb-3 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-base/10 text-brand-base">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-brand-ink">Método de pago</h3>
            </header>
            <p className="text-sm font-medium text-brand-ink">{paymentLabel}</p>
            <p className="mt-1 text-sm text-brand-muted">
              Completarás el pago de forma segura en el siguiente paso.
            </p>
          </section>
        </div>

        <section className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-base/10 text-brand-base">
            <Truck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="flex flex-1 items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-brand-ink">Entrega estimada</p>
              <p className="text-sm text-brand-muted">{shipping.estimatedDays}</p>
            </div>
            <span className="text-sm font-medium">
              {shippingCost === 0 ? (
                <span className="text-green-600">Envío gratis</span>
              ) : (
                formatPrice(shippingCost)
              )}
            </span>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-brand-ink">
            <Package className="h-5 w-5 text-brand-base" aria-hidden="true" />
            Resumen del pedido
          </h3>
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={`${item.id}-${item.size}-${item.color}`}
                className="flex justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-brand-ink">{item.name}</p>
                  <p className="mt-0.5 text-brand-muted">
                    {[item.size, item.color].filter(Boolean).join(" • ") || "Estándar"} · Cant:{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="whitespace-nowrap font-medium text-brand-ink">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-muted">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-muted">Envío</dt>
              <dd>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold">
              <dt>Total</dt>
              <dd className="text-brand-base">{formatPrice(total)}</dd>
            </div>
          </dl>
        </section>

        <div className="rounded-xl border border-border bg-brand-surface p-4 text-xs text-muted-foreground">
          <p>
            Al confirmar tu pedido, aceptas nuestros{" "}
            <a href={routes.policies} className="text-brand-base hover:underline">
              términos y condiciones
            </a>{" "}
            y{" "}
            <a href={routes.policies} className="text-brand-base hover:underline">
              política de privacidad
            </a>
            .
          </p>
        </div>

        <div className="flex gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isProcessing}
          >
            Volver al pago
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={isProcessing || !validationState.isValid}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />{" "}
                Procesando...
              </div>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Confirmar pedido
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
