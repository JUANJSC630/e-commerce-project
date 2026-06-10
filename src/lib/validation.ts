export interface ShippingData {
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

/**
 * Card data never lives in our state: the gateway tokenizes it inside its own
 * PCI-scoped iframes on the payment page. The checkout only records which
 * method the customer wants to use.
 */
export interface PaymentData {
  method: "card" | "pse"
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateShippingData(data: ShippingData): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: {} }
  const required: (keyof ShippingData)[] = [
    "firstName",
    "lastName",
    "email",
    "address",
    "city",
    "country",
  ]

  for (const field of required) {
    if (!data[field] || data[field].trim() === "") {
      result.isValid = false
      result.errors[field] = "Este campo es requerido"
    }
  }

  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    result.isValid = false
    result.errors["email"] = "Email inválido"
  }

  if (data.zipCode && !/^\d{5,6}$/.test(data.zipCode)) {
    result.isValid = false
    result.errors["zipCode"] = "Código postal inválido"
  }

  return result
}

export function validatePaymentData(data: PaymentData): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: {} }

  if (data.method !== "card" && data.method !== "pse") {
    result.isValid = false
    result.errors["method"] = "Selecciona un método de pago"
  }

  return result
}
