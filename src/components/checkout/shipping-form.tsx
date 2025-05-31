"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ShippingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface ShippingFormProps {
  data: ShippingData
  onUpdate: (data: ShippingData) => void
  onNext: () => void
  onBack: () => void
}

export function ShippingForm({ data, onUpdate, onNext, onBack }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingData>(data)
  const [errors, setErrors] = useState<Partial<ShippingData>>({})

  const handleChange = (field: keyof ShippingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validateForm = () => {
    const newErrors: Partial<ShippingData> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "Nombre es requerido"
    if (!formData.lastName.trim()) newErrors.lastName = "Apellido es requerido"
    if (!formData.email.trim()) newErrors.email = "Email es requerido"
    if (!formData.phone.trim()) newErrors.phone = "Teléfono es requerido"
    if (!formData.address.trim()) newErrors.address = "Dirección es requerida"
    if (!formData.city.trim()) newErrors.city = "Ciudad es requerida"
    if (!formData.zipCode.trim()) newErrors.zipCode = "Código postal es requerido"

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
      <h2 className="font-montserrat font-semibold text-xl mb-6">Información de envío</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Apellido *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
        </div>
        <div>
          <Label htmlFor="address">Dirección *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && <p className="text-destructive text-sm mt-1">{errors.address}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">Ciudad *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
          </div>
          <div>
            <Label htmlFor="state">Departamento</Label>
            <Input id="state" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="zipCode">Código Postal *</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              className={errors.zipCode ? "border-destructive" : ""}
            />
            {errors.zipCode && <p className="text-destructive text-sm mt-1">{errors.zipCode}</p>}
          </div>
        </div>
        <div className="flex gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Volver al carrito
          </Button>
          <Button type="submit" className="flex-1">
            Continuar al pago
          </Button>
        </div>
      </form>
    </div>
  )
}
