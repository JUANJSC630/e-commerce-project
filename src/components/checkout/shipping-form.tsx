"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddressSelectors } from "@/components/checkout/address-selectors"
import type { AddressValue } from "@/components/checkout/address-selectors"

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
  errors?: Record<string, string>
  onUpdate: (data: ShippingData) => void
  onNext: () => void
  onBack: () => void
}

// Import validateShippingData function from checkout-flow page
const validateShippingData = (data: ShippingData) => {
  const required = [
    "firstName",
    "lastName",
    "email",
    "address",
    "city",
    "country",
    "state",
    "phone",
  ]
  const validationResults: {
    isValid: boolean
    errors: Record<string, string>
  } = {
    isValid: true,
    errors: {},
  }

  required.forEach((field) => {
    const value = data[field as keyof typeof data]
    if (!value || (typeof value === "string" && value.trim() === "")) {
      validationResults.isValid = false
      validationResults.errors[field] = "Este campo es requerido"
    }
  })

  // Email validation
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    validationResults.isValid = false
    validationResults.errors["email"] = "Email inválido"
  }

  // Zip code validation - assuming Colombian format (6 digits)
  if (data.zipCode && !/^\d{5,6}$/.test(data.zipCode)) {
    validationResults.isValid = false
    validationResults.errors["zipCode"] = "Código postal inválido"
  }

  return validationResults
}

export function ShippingForm({
  data,
  errors: externalErrors,
  onUpdate,
  onNext,
  onBack,
}: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingData>(data)
  const [errors, setErrors] = useState<Record<string, string>>(externalErrors || {})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  // Update errors when external errors change
  useEffect(() => {
    if (externalErrors && Object.keys(externalErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...externalErrors }))
    }
  }, [externalErrors])

  // Mirror the fields up to the parent as they're typed (not just on submit), so
  // the checkout draft can persist a partially-filled form - closing the tab
  // mid-shipping won't lose it. `onUpdate` is the parent's stable setState and
  // `data` is never synced back into `formData`, so this can't loop.
  useEffect(() => {
    onUpdate(formData)
  }, [formData, onUpdate])

  // Function to validate a single field
  const validateField = (field: keyof ShippingData, value: string) => {
    const error = ""

    // Required field check
    if (
      ["firstName", "lastName", "email", "address", "city", "country", "phone", "state"].includes(
        field,
      )
    ) {
      if (!value || value.trim() === "") {
        return "Este campo es requerido"
      }
    }

    // Email validation
    if (field === "email" && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Email inválido"
      }
    }

    // Phone validation
    if (field === "phone" && value) {
      const digitsOnly = value.replace(/\D/g, "")
      if (digitsOnly.length < 10) {
        return "Teléfono debe tener al menos 10 dígitos"
      }
    }

    // Zip code validation
    if (field === "zipCode" && value) {
      if (!/^\d{5,6}$/.test(value)) {
        return "Código postal inválido"
      }
    }

    return error
  }

  const handleChange = (field: keyof ShippingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Mark field as touched
    if (!touchedFields[field]) {
      setTouchedFields((prev) => ({ ...prev, [field]: true }))
    }

    // Perform real-time validation for touched fields
    const error = validateField(field, value)

    // If there's an error, add it; otherwise, create a new object without the error field
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }))
    } else {
      // Create new object without the field if there's no error
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Country/state/city come from the AddressSelectors as names; merge them and
  // clear any errors on the changed fields.
  const handleAddressChange = (patch: Partial<AddressValue>) => {
    setFormData((prev) => ({ ...prev, ...patch }))
    setErrors((prev) => {
      const next = { ...prev }
      for (const field of Object.keys(patch)) delete next[field]
      return next
    })
  }

  // Focus out handler - validate field when user leaves it
  const handleBlur = (field: keyof ShippingData) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])

    // Same approach as handleChange - add or remove the error
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }))
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, field) => {
        acc[field] = true
        return acc
      },
      {} as Record<string, boolean>,
    )
    setTouchedFields(allTouched)

    const validationResult = validateShippingData(formData)
    setErrors(validationResult.errors as Partial<ShippingData>)
    return validationResult.isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onUpdate(formData)
      onNext()
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector(".border-destructive")
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  return (
    <div className="max-w-2xl text-foreground">
      <h2 className="font-display font-semibold text-xl mb-6">Información de envío</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              onBlur={() => handleBlur("firstName")}
              className={errors.firstName ? "border-destructive" : ""}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="text-destructive text-sm mt-1 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                {errors.firstName}
              </p>
            )}
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
        <AddressSelectors
          value={{ country: formData.country, state: formData.state, city: formData.city }}
          onChange={handleAddressChange}
          errors={{ country: errors.country, state: errors.state, city: errors.city }}
          zipField={
            <div>
              <Label htmlFor="zipCode">Código Postal (opcional)</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleChange("zipCode", e.target.value)}
                className={errors.zipCode ? "border-destructive" : ""}
              />
              {errors.zipCode && <p className="text-destructive text-sm mt-1">{errors.zipCode}</p>}
            </div>
          }
        />
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
