"use client"

import { useState } from "react"
import { Check, MapPin, CreditCard, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

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
      cardNumber?: string
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
  onConfirm: () => void
  onBack: () => void
}

interface SectionData {
  icon: React.ElementType;
  title: string;
  data: Record<string, string | number | undefined>;
  fields: string[];
  bgColor: string;
}

export function OrderConfirmation({ orderData, onConfirm, onBack }: OrderConfirmationProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const handleConfirm = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    onConfirm()
  }

  const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50000 ? 0 : 5000
  const total = subtotal + shipping

  const sections: SectionData[] = [
    {
      icon: MapPin,
      title: "Información de envío",
      data: orderData.shipping,
      fields: ["firstName", "lastName", "address", "city", "phone", "email"],
      bgColor: "bg-brand-silver/30", // Fondo Silver claro
    },
    {
      icon: CreditCard,
      title: "Método de pago",
      data: orderData.payment,
      fields: ["method", "cardNumber"],
      bgColor: "bg-brand-silver/30",
    },
    {
      icon: Truck,
      title: "Información de entrega",
      data: { estimated: "3-5 días hábiles", cost: shipping === 0 ? "Gratis" : `$${shipping.toLocaleString()}` },
      fields: ["estimated", "cost"],
      bgColor: "bg-brand-silver/30",
    },
  ];

  return (
    <div className="max-w-2xl text-foreground">
      <h2 className="font-montserrat font-semibold text-xl mb-6">Confirmar pedido</h2>
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className={`${section.bgColor} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-3">
              <section.icon className="w-5 h-5 text-brand-goldenYellow" />
              <h3 className="font-semibold">{section.title}</h3>
            </div>
            <div className="text-sm space-y-1">
              {section.fields.map((field) => {
                let value = (section.data as Record<string, string | number | undefined>)[field]
                if (field === "cardNumber" && typeof value === 'string') value = `Tarjeta terminada en ****${value.slice(-4)}`
                if (field === "method" && typeof value === 'string') {
                  if (value === "card") value = "Tarjeta de Crédito/Débito"
                  else if (value === "mercadopago") value = "MercadoPago"
                  else if (value === "bank") value = "Transferencia Bancaria"
                }
                return value ? (
                  <p key={field}>
                    {typeof value === "string" && field.match(/Name|Address|City|Email|Phone/i)
                      ? value
                      : `${field.charAt(0).toUpperCase() + field.slice(1)}: ${value}`}
                  </p>
                ) : null
              })}
            </div>
          </div>
        ))}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold mb-4">Resumen del pedido</h3>
          <div className="space-y-3 mb-4">
            {orderData.items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">
                    Talla: {item.size} • Color: {item.color} • Cant: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">${(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span>{shipping === 0 ? "Gratis" : `$${shipping.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-brand-goldenYellow">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground bg-brand-offWhite rounded-xl p-4 border border-border">
          <p>
            Al confirmar tu pedido, aceptas nuestros{" "}
            <a href="#" className="text-brand-goldenYellow hover:underline">
              términos y condiciones
            </a>{" "}
            y{" "}
            <a href="#" className="text-brand-goldenYellow hover:underline">
              política de privacidad
            </a>
            .
          </p>
        </div>
        <div className="flex gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={isProcessing}>
            Volver al pago
          </Button>
          <Button onClick={handleConfirm} className="flex-1" disabled={isProcessing}>
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />{" "}
                Procesando...
              </div>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" /> Confirmar pedido
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
