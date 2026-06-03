"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CreditCard, Smartphone, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { paymentMethods as configPaymentMethods } from "@/config/store.config"
import { getCardType, validatePaymentData } from "@/lib/validation"
import type { LucideIcon } from "lucide-react"

const methodIcons: Record<string, LucideIcon> = {
  card: CreditCard,
  mercadopago: Smartphone,
  bank: Building,
}

interface PaymentData {
  method: "card" | "mercadopago" | "bank"
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
}

interface PaymentFormProps {
  data: PaymentData
  errors?: Record<string, string>
  onUpdate: (data: PaymentData) => void
  onNext: () => void
  onBack: () => void
}

export function PaymentForm({
  data,
  errors: externalErrors,
  onUpdate,
  onNext,
  onBack,
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentData>(data)
  const [errors, setErrors] = useState<Record<string, string>>(externalErrors || {})

  // Update formData when data prop changes
  useEffect(() => {
    setFormData(data)
  }, [data])

  // Update errors when externalErrors prop changes
  useEffect(() => {
    setErrors(externalErrors || {})
  }, [externalErrors])

  const paymentMethods = configPaymentMethods.map((m) => ({
    ...m,
    icon: methodIcons[m.id] ?? CreditCard,
  }))

  const handleMethodChange = (method: PaymentData["method"]) => {
    setFormData((prev) => ({ ...prev, method }))
    setErrors({})
  }

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, "")
    const groups = []

    // Group in blocks of 4 digits
    for (let i = 0; i < digits.length; i += 4) {
      groups.push(digits.substring(i, i + 4))
    }

    return groups.join(" ").trim()
  }

  const formatExpiryDate = (value: string): string => {
    const digits = value.replace(/\D/g, "")

    if (digits.length <= 2) {
      return digits
    }

    return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`
  }

  const handleChange = (field: keyof PaymentData, value: string) => {
    let formattedValue = value

    // Apply formatting based on field type
    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value)
    } else if (field === "expiryDate") {
      formattedValue = formatExpiryDate(value)
    } else if (field === "cvv") {
      // Only allow digits for CVV
      formattedValue = value.replace(/\D/g, "")
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))

    if (errors[field]) {
      // Remove the error by creating a new object without the field
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const validationResult = validatePaymentData(formData)
    setErrors(validationResult.errors as Record<string, string>)
    return validationResult.isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onUpdate(formData)
      onNext()
    }
  }

  return (
    <div className="max-w-2xl text-foreground">
      <h2 className="font-display font-semibold text-xl mb-6">Método de pago</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label id="payment-method-legend">Selecciona tu método de pago</Label>
          <div role="radiogroup" aria-labelledby="payment-method-legend" className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              const isSelected = formData.method === method.id
              return (
                <div
                  key={method.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  className={cn(
                    "border rounded-xl p-4 cursor-pointer transition-all",
                    isSelected
                      ? "border-brand-base bg-brand-base/10"
                      : "border-border hover:border-muted-foreground",
                  )}
                  onClick={() => handleMethodChange(method.id as PaymentData["method"])}
                  onKeyDown={(e) => {
                    const ids = paymentMethods.map((m) => m.id)
                    const cur = ids.indexOf(method.id)
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleMethodChange(method.id as PaymentData["method"])
                    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault()
                      handleMethodChange(ids[(cur + 1) % ids.length] as PaymentData["method"])
                    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault()
                      handleMethodChange(
                        ids[(cur - 1 + ids.length) % ids.length] as PaymentData["method"],
                      )
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
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {formData.method === "card" && (
          <div className="space-y-4 p-4 bg-brand-surface-alt/30 rounded-xl">
            {" "}
            {/* Fondo Silver claro */}
            <div>
              <Label htmlFor="cardName">Nombre en la tarjeta *</Label>
              <Input
                id="cardName"
                value={formData.cardName}
                onChange={(e) => handleChange("cardName", e.target.value)}
                className={errors.cardName ? "border-destructive" : ""}
                placeholder="Juan Pérez"
              />
              {errors.cardName && (
                <p className="text-destructive text-sm mt-1">{errors.cardName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cardNumber">Número de tarjeta *</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => handleChange("cardNumber", e.target.value)}
                  className={errors.cardNumber ? "border-destructive pr-10" : "pr-10"}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                {formData.cardNumber && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getCardType(formData.cardNumber) !== "unknown" && (
                      <div className="text-xs font-medium">
                        {getCardType(formData.cardNumber).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.cardNumber && (
                <p className="text-destructive text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Fecha de vencimiento *</Label>
                <Input
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) => handleChange("expiryDate", e.target.value)}
                  className={errors.expiryDate ? "border-destructive" : ""}
                  placeholder="MM/AA"
                  maxLength={5}
                  inputMode="numeric"
                />
                {errors.expiryDate && (
                  <p className="text-destructive text-sm mt-1">{errors.expiryDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  value={formData.cvv}
                  onChange={(e) => handleChange("cvv", e.target.value)}
                  className={errors.cvv ? "border-destructive" : ""}
                  placeholder="123"
                  maxLength={4}
                  inputMode="numeric"
                />
                {errors.cvv && <p className="text-destructive text-sm mt-1">{errors.cvv}</p>}
              </div>
            </div>
          </div>
        )}
        {formData.method === "mercadopago" && (
          <div className="p-4 bg-brand-base/10 text-foreground rounded-xl">
            <p className="text-sm">
              Serás redirigido a MercadoPago para completar tu pago de forma segura.
            </p>
          </div>
        )}
        {formData.method === "bank" && (
          <div className="p-4 bg-brand-muted/20 text-foreground rounded-xl">
            <p className="text-sm mb-2">Recibirás los datos bancarios por email.</p>
            <p className="text-xs text-muted-foreground">
              Tu pedido se procesará una vez confirmemos el pago.
            </p>
          </div>
        )}
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
