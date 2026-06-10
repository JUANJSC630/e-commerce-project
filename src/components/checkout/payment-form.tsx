"use client"

import type React from "react"
import { useState } from "react"
import { CreditCard, Landmark, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { PaymentData } from "@/lib/validation"
import type { LucideIcon } from "lucide-react"

/**
 * Step 3 of the checkout: the customer picks HOW they'll pay. The actual
 * charge happens after the order is created, on the payment page, where the
 * gateway renders its own PCI-scoped fields — no card data is collected here.
 */

const PAYMENT_OPTIONS: Array<{
  id: PaymentData["method"]
  name: string
  description: string
  icon: LucideIcon
}> = [
  {
    id: "card",
    name: "Tarjeta de crédito o débito",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
  },
  {
    id: "pse",
    name: "PSE",
    description: "Paga con débito desde tu cuenta bancaria",
    icon: Landmark,
  },
]

interface PaymentFormProps {
  data: PaymentData
  errors?: Record<string, string>
  onUpdate: (data: PaymentData) => void
  onNext: () => void
  onBack: () => void
}

export function PaymentForm({ data, errors, onUpdate, onNext, onBack }: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentData["method"]>(data.method)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ method })
    onNext()
  }

  return (
    <div className="max-w-2xl text-foreground">
      <h2 className="font-display font-semibold text-xl mb-6">Método de pago</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label id="payment-method-legend">Selecciona tu método de pago</Label>
          <div role="radiogroup" aria-labelledby="payment-method-legend" className="space-y-3">
            {PAYMENT_OPTIONS.map((option) => {
              const Icon = option.icon
              const isSelected = method === option.id
              return (
                <div
                  key={option.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  className={cn(
                    "border rounded-xl p-4 cursor-pointer transition-all",
                    isSelected
                      ? "border-brand-base bg-brand-base/10"
                      : "border-border hover:border-muted-foreground",
                  )}
                  onClick={() => setMethod(option.id)}
                  onKeyDown={(e) => {
                    const ids = PAYMENT_OPTIONS.map((o) => o.id)
                    const cur = ids.indexOf(option.id)
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setMethod(option.id)
                    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault()
                      setMethod(ids[(cur + 1) % ids.length])
                    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault()
                      setMethod(ids[(cur - 1 + ids.length) % ids.length])
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 transition-all",
                        isSelected ? "border-brand-base bg-brand-base" : "border-muted-foreground",
                      )}
                    >
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-background scale-50" />
                      )}
                    </div>
                    <Icon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{option.name}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {errors?.method && <p className="text-destructive text-sm">{errors.method}</p>}
        </div>

        <div className="flex items-start gap-3 p-4 bg-brand-surface-alt/30 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-brand-base shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Al confirmar tu pedido te llevaremos a completar el pago de forma segura. Los datos de
            tu tarjeta se ingresan directamente con la pasarela de pago y nunca pasan por nuestra
            tienda.
          </p>
        </div>

        <div className="flex gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Volver a envío
          </Button>
          <Button type="submit" className="flex-1">
            Revisar pedido
          </Button>
        </div>
      </form>
    </div>
  )
}
