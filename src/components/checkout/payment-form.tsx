"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  errors?: Record<string, string>
  onUpdate: (data: PaymentData) => void
  onNext: () => void
  onBack: () => void
}

export function PaymentForm({ data, errors: externalErrors, onUpdate, onNext, onBack }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentData>(data)
  const [errors, setErrors] = useState<Record<string, string>>(externalErrors || {})
  
  // Update errors when external errors change
  useEffect(() => {
    if (externalErrors && Object.keys(externalErrors).length > 0) {
      setErrors(prev => ({...prev, ...externalErrors}));
    }
  }, [externalErrors])
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

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const groups = [];
    
    // Group in blocks of 4 digits
    for (let i = 0; i < digits.length; i += 4) {
      groups.push(digits.substring(i, i + 4));
    }
    
    return groups.join(' ').trim();
  };

  const formatExpiryDate = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) {
      return digits;
    }
    
    return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
  };

  const handleChange = (field: keyof PaymentData, value: string) => {
    let formattedValue = value;
    
    // Apply formatting based on field type
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      // Only allow digits for CVV
      formattedValue = value.replace(/\D/g, '');
    }
    
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    
    if (errors[field]) {
      // Remove the error by creating a new object without the field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  // Luhn algorithm for credit card validation
  const validateCreditCardWithLuhn = (number: string): boolean => {
    const digits = number.replace(/\D/g, '');
    if (!digits) return false;
    
    let sum = 0;
    let shouldDouble = false;
    
    // Loop from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  }

  // Get card type based on number
  const getCardType = (number: string): string => {
    const cleanNumber = number.replace(/\D/g, '');
    
    // Define card patterns
    const cardPatterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3(?:0[0-5]|[68])/,
      jcb: /^(?:2131|1800|35)/,
    };
    
    if (cardPatterns.visa.test(cleanNumber)) return "visa";
    if (cardPatterns.mastercard.test(cleanNumber)) return "mastercard";
    if (cardPatterns.amex.test(cleanNumber)) return "amex";
    if (cardPatterns.discover.test(cleanNumber)) return "discover";
    if (cardPatterns.diners.test(cleanNumber)) return "diners";
    if (cardPatterns.jcb.test(cleanNumber)) return "jcb";
    
    return "unknown";
  }

  // Define payment validation function
  const validatePaymentData = (data: PaymentData) => {
    const validationResults = {
      isValid: true,
      errors: {} as Record<string, string>,
    }

    if (data.method === "card") {
      const cleanCardNumber = data.cardNumber.replace(/\s/g, "");
      const cardType = getCardType(cleanCardNumber);

      // Card number validation (length and format)
      if (!cleanCardNumber) {
        validationResults.isValid = false;
        validationResults.errors["cardNumber"] = "Número de tarjeta es requerido";
      } else if (!/^\d+$/.test(cleanCardNumber)) {
        validationResults.isValid = false;
        validationResults.errors["cardNumber"] = "Número de tarjeta debe contener solo dígitos";
      } else {
        // Validate card length based on type
        const isValidLength = 
          (cardType === "amex" && cleanCardNumber.length === 15) ||
          (cardType === "diners" && cleanCardNumber.length === 14) ||
          (["visa", "mastercard", "discover"].includes(cardType) && cleanCardNumber.length === 16) ||
          (cardType === "unknown" && cleanCardNumber.length >= 13 && cleanCardNumber.length <= 19);
        
        if (!isValidLength) {
          validationResults.isValid = false;
          validationResults.errors["cardNumber"] = "Longitud de tarjeta inválida para este tipo de tarjeta";
        } else if (!validateCreditCardWithLuhn(cleanCardNumber)) {
          validationResults.isValid = false;
          validationResults.errors["cardNumber"] = "Número de tarjeta inválido (verificación fallida)";
        }
      }

      // Expiry date validation (MM/YY format and not expired)
      if (!data.expiryDate) {
        validationResults.isValid = false;
        validationResults.errors["expiryDate"] = "Fecha de expiración es requerida";
      } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(data.expiryDate)) {
        validationResults.isValid = false;
        validationResults.errors["expiryDate"] = "Formato inválido (MM/AA)";
      } else {
        // Check if the card is not expired
        const [month, year] = data.expiryDate.split('/');
        const expiryDate = new Date(2000 + parseInt(year, 10), parseInt(month, 10), 0); // Last day of the month
        const currentDate = new Date();
        
        if (expiryDate < currentDate) {
          validationResults.isValid = false;
          validationResults.errors["expiryDate"] = "La tarjeta ha expirado";
        }
      }

      // CVV validation (3-4 digits based on card type)
      if (!data.cvv) {
        validationResults.isValid = false;
        validationResults.errors["cvv"] = "CVV es requerido";
      } else if (!/^\d+$/.test(data.cvv)) {
        validationResults.isValid = false;
        validationResults.errors["cvv"] = "CVV debe contener solo dígitos";
      } else {
        const requiredCvvLength = cardType === "amex" ? 4 : 3;
        if (data.cvv.length !== requiredCvvLength) {
          validationResults.isValid = false;
          validationResults.errors["cvv"] = cardType === "amex" 
            ? "CVV para American Express debe tener 4 dígitos" 
            : "CVV debe tener 3 dígitos";
        }
      }

      // Card name validation
      if (!data.cardName || data.cardName.trim() === "") {
        validationResults.isValid = false;
        validationResults.errors["cardName"] = "Nombre en la tarjeta es requerido";
      }
    }

    return validationResults
  }

  const validateForm = () => {
    const validationResult = validatePaymentData(formData);
    setErrors(validationResult.errors as Record<string, string>);
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
                className={errors.cardName ? "border-destructive" : ""}
                placeholder="Juan Pérez"
              />
              {errors.cardName && <p className="text-destructive text-sm mt-1">{errors.cardName}</p>}
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
              {errors.cardNumber && <p className="text-destructive text-sm mt-1">{errors.cardNumber}</p>}
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
                {errors.expiryDate && <p className="text-destructive text-sm mt-1">{errors.expiryDate}</p>}
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
