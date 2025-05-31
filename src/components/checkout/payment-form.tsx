"use client"

import type React from "react"
import { useState } from "react"
import { CreditCard, Smartphone, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface PaymentData {
  method: "card" | "mercadopago" | "bank"
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
}

interface PaymentFormProps {
  data: PaymentData
  onUpdate: (data: PaymentData) => void
  onNext: () => void
  onBack: () => void
}

export function PaymentForm({ data, onUpdate, onNext, onBack }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentData>(data)
  const [errors, setErrors] = useState<Partial<PaymentData>>({})
  const paymentMethods = [
    {
      id: "card" as const,
      name: "Tarjeta de Crédito/Débito",
      icon: CreditCard,
      description: "Visa, Mastercard, American Express",
    },
    {
      id: "mercadopago" as const,
      name: "MercadoPago",
      icon: Smartphone,
      description: "Paga con tu cuenta de MercadoPago",
    },
    {
      id: "bank" as const,
      name: "Transferencia Bancaria",
      icon: Building,
      description: "Pago por transferencia bancaria",
    },
  ]

  const handleMethodChange = (method: PaymentData["method"]) => {
    setFormData((prev) => ({ ...prev, method }))
    setErrors({})
  }

  const handleChange = (field: keyof PaymentData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<PaymentData> = {}

    if (formData.method === "card") {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = "Número de tarjeta es requerido"
      if (!formData.expiryDate.trim()) newErrors.expiryDate = "Fecha de vencimiento es requerida"
      if (!formData.cvv.trim()) newErrors.cvv = "CVV es requerido"
      if (!formData.cardName.trim()) newErrors.cardName = "Nombre en la tarjeta es requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      <h2 className="font-montserrat font-semibold text-xl mb-6">Método de pago</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label>Selecciona tu método de pago</Label>
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <div
                key={method.id}
                className={cn(
                  "border rounded-xl p-4 cursor-pointer transition-all",
                  formData.method === method.id
                    ? "border-brand-goldenYellow bg-brand-goldenYellow/10"
                    : "border-border hover:border-muted-foreground",
                )}
                onClick={() => handleMethodChange(method.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 transition-all",
                      formData.method === method.id
                        ? "border-brand-goldenYellow bg-brand-goldenYellow"
                        : "border-muted-foreground",
                    )}
                  >
                    {formData.method === method.id && (
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
        {formData.method === "card" && (
          <div className="space-y-4 p-4 bg-brand-silver/30 rounded-xl">
            {" "}
            {/* Fondo Silver claro */}
            <div>
              <Label htmlFor="cardName">Nombre en la tarjeta *</Label>
              <Input
                id="cardName"
                value={formData.cardName}
                onChange={(e) => handleChange("cardName", e.target.value)}
                className={errors.cardName ? "border-red-500" : ""}
                placeholder="Juan Pérez"
              />
              {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
            </div>
            <div>
              <Label htmlFor="cardNumber">Número de tarjeta *</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => handleChange("cardNumber", e.target.value)}
                className={errors.cardNumber ? "border-red-500" : ""}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Fecha de vencimiento *</Label>
                <Input
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) => handleChange("expiryDate", e.target.value)}
                  className={errors.expiryDate ? "border-red-500" : ""}
                  placeholder="MM/AA"
                  maxLength={5}
                />
                {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
              </div>

              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  value={formData.cvv}
                  onChange={(e) => handleChange("cvv", e.target.value)}
                  className={errors.cvv ? "border-red-500" : ""}
                  placeholder="123"
                  maxLength={4}
                />
                {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
              </div>
            </div>
          </div>
        )}
        {formData.method === "mercadopago" && (
          <div className="p-4 bg-brand-goldenYellow/10 text-foreground rounded-xl">
            <p className="text-sm">Serás redirigido a MercadoPago para completar tu pago de forma segura.</p>
          </div>
        )}
        {formData.method === "bank" && (
          <div className="p-4 bg-brand-taupe/20 text-foreground rounded-xl">
            <p className="text-sm mb-2">Recibirás los datos bancarios por email.</p>
            <p className="text-xs text-muted-foreground">Tu pedido se procesará una vez confirmemos el pago.</p>
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
