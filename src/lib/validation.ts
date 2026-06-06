export function luhnCheck(number: string): boolean {
  const digits = number.replace(/\D/g, "")
  if (!digits) return false

  let sum = 0
  let shouldDouble = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10)
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

export function getCardType(number: string): string {
  const n = number.replace(/\D/g, "")
  if (/^4/.test(n)) return "visa"
  if (/^5[1-5]/.test(n)) return "mastercard"
  if (/^3[47]/.test(n)) return "amex"
  if (/^6(?:011|5)/.test(n)) return "discover"
  if (/^3(?:0[0-5]|[68])/.test(n)) return "diners"
  if (/^(?:2131|1800|35)/.test(n)) return "jcb"
  return "unknown"
}

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

export interface PaymentData {
  method: "card" | "mercadopago" | "bank"
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
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

  if (data.method !== "card") return result

  const clean = data.cardNumber.replace(/\s/g, "")
  const cardType = getCardType(clean)

  if (!clean) {
    result.isValid = false
    result.errors["cardNumber"] = "Número de tarjeta es requerido"
  } else if (!/^\d+$/.test(clean)) {
    result.isValid = false
    result.errors["cardNumber"] = "Número de tarjeta debe contener solo dígitos"
  } else {
    const validLength =
      (cardType === "amex" && clean.length === 15) ||
      (cardType === "diners" && clean.length === 14) ||
      (["visa", "mastercard", "discover"].includes(cardType) && clean.length === 16) ||
      (cardType === "unknown" && clean.length >= 13 && clean.length <= 19)

    if (!validLength) {
      result.isValid = false
      result.errors["cardNumber"] = "Longitud de tarjeta inválida para este tipo de tarjeta"
    } else if (!luhnCheck(clean)) {
      result.isValid = false
      result.errors["cardNumber"] = "Número de tarjeta inválido (verificación fallida)"
    }
  }

  if (!data.expiryDate) {
    result.isValid = false
    result.errors["expiryDate"] = "Fecha de expiración es requerida"
  } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(data.expiryDate)) {
    result.isValid = false
    result.errors["expiryDate"] = "Formato inválido (MM/AA)"
  } else {
    const [month, year] = data.expiryDate.split("/")
    const expiry = new Date(2000 + parseInt(year, 10), parseInt(month, 10), 0)
    if (expiry < new Date()) {
      result.isValid = false
      result.errors["expiryDate"] = "La tarjeta ha expirado"
    }
  }

  if (!data.cvv) {
    result.isValid = false
    result.errors["cvv"] = "CVV es requerido"
  } else if (!/^\d+$/.test(data.cvv)) {
    result.isValid = false
    result.errors["cvv"] = "CVV debe contener solo dígitos"
  } else {
    const required = getCardType(data.cardNumber.replace(/\s/g, "")) === "amex" ? 4 : 3
    if (data.cvv.length !== required) {
      result.isValid = false
      result.errors["cvv"] =
        required === 4
          ? "CVV para American Express debe tener 4 dígitos"
          : "CVV debe tener 3 dígitos"
    }
  }

  if (!data.cardName || data.cardName.trim() === "") {
    result.isValid = false
    result.errors["cardName"] = "Nombre en la tarjeta es requerido"
  }

  return result
}
