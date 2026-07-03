"use client"

import { useId, useState } from "react"
import { CreditCard, Landmark, Lock, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFormatPrice } from "@/components/providers/settings-provider"
import { MpCardForm } from "./mp-card-form"
import { PseForm } from "./pse-form"

interface MercadoPagoCheckoutProps {
  orderId: string
  orderNumber: string
  amount: number
  /** Method chosen during checkout - preselects the matching tab. */
  preferredMethod?: string
}

const METHODS = [
  { id: "card", title: "Tarjeta", subtitle: "Crédito o débito", icon: CreditCard },
  { id: "pse", title: "PSE", subtitle: "Transferencia bancaria", icon: Landmark },
] as const

type MethodId = (typeof METHODS)[number]["id"]

/** Payment hub for an order: card (CardForm) and PSE, side by side. */
export function MercadoPagoCheckout({
  orderId,
  orderNumber,
  amount,
  preferredMethod,
}: MercadoPagoCheckoutProps) {
  const formatPrice = useFormatPrice()
  const baseId = useId()
  const [method, setMethod] = useState<MethodId>(preferredMethod === "pse" ? "pse" : "card")

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-base/10 px-3 py-1 text-xs font-medium text-brand-base">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Pago seguro
        </span>
        <h1 className="font-display font-bold text-2xl text-brand-ink mt-2">Completa tu pago</h1>
        <p className="text-sm text-brand-muted mt-0.5">
          Pedido <span className="font-medium text-brand-ink">{orderNumber}</span>
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand-muted">
          Total a pagar
        </span>
        <span className="font-display text-2xl font-bold text-brand-ink">{formatPrice(amount)}</span>
      </div>

      <div role="tablist" aria-label="Método de pago" className="mt-5 grid grid-cols-2 gap-3">
        {METHODS.map(({ id, title, subtitle, icon: Icon }) => {
          const selected = method === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${id}`}
              onClick={() => setMethod(id)}
              className={cn(
                "group flex items-center gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-all outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected
                  ? "border-brand-base bg-brand-base/5"
                  : "border-border bg-background hover:border-brand-base/40 hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors",
                  selected
                    ? "bg-brand-base text-brand-on-base"
                    : "bg-muted text-brand-muted group-hover:text-brand-ink",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-brand-ink">{title}</span>
                <span className="block truncate text-xs text-brand-muted">{subtitle}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${method}`}
        aria-labelledby={`${baseId}-tab-${method}`}
        className="mt-5"
      >
        {method === "card" ? (
          <MpCardForm orderId={orderId} amount={amount} />
        ) : (
          <PseForm orderId={orderId} />
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-border/60 pt-4">
        <Lock className="h-3.5 w-3.5 text-brand-muted" aria-hidden="true" />
        <p className="text-xs text-brand-muted">
          Procesado de forma segura por MercadoPago · No almacenamos tus datos
        </p>
      </div>
    </div>
  )
}
