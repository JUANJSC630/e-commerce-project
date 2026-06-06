"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CheckoutProgress } from "@/components/checkout/checkout-progress"
import { CartSummary } from "@/components/checkout/cart-summary"
import { ShippingForm } from "@/components/checkout/shipping-form"
import { PaymentForm } from "@/components/checkout/payment-form"
import { OrderConfirmation } from "@/components/checkout/order-confirmation"
import { toast } from "sonner"
import { useCart } from "@/hooks/use-cart"
import { routes } from "@/config/store.config"
import { useSettings } from "@/components/providers/settings-provider"
import { validateShippingData, validatePaymentData } from "@/lib/validation"

const steps = ["Carrito", "Envío", "Pago", "Confirmación"]

export default function CheckoutPage() {
  const { locale, brand } = useSettings()
  const { items, updateItemQuantity, removeItem } = useCart()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: locale.defaultCountry,
  })
  const [paymentData, setPaymentData] = useState<{
    method: "card" | "mercadopago" | "bank"
    cardNumber: string
    expiryDate: string
    cvv: string
    cardName: string
  }>({
    method: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })
  // Declaración de errores de envío - Se usa en handleOrderConfirm y se pasa a ShippingForm
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({})
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create cart item objects with the structure expected by CartSummary component
  const cartItemsForSummary = items.map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    size: item.selectedSize || "Única",
    color: item.selectedColor || "Estándar",
  }))

  const handleUpdateQuantity = (id: string, quantity: number, size?: string, color?: string) => {
    updateItemQuantity(id, quantity, size, color)
  }

  const handleRemoveItem = (id: string, size?: string, color?: string) => {
    removeItem(id, size, color)
  }

  // Each step's form validates its own data and only calls onNext when valid, so
  // these just advance. (Re-validating the parent state here was a bug: onUpdate
  // hadn't flushed yet, so the first click read stale/empty data and failed.)
  const handleShippingNext = () => setCurrentStep(3)

  const handlePaymentNext = () => setCurrentStep(4)

  const handleOrderConfirm = async () => {
    if (isSubmitting) return

    const shippingValidation = validateShippingData(shippingData)
    const paymentValidation = validatePaymentData(paymentData)
    if (!shippingValidation.isValid || !paymentValidation.isValid) {
      toast.error("Por favor revisa los datos de envío y pago antes de confirmar.")
      if (!shippingValidation.isValid) {
        setCurrentStep(2)
        setShippingErrors(shippingValidation.errors)
      } else {
        setCurrentStep(3)
        setPaymentErrors(paymentValidation.errors)
      }
      return
    }

    setIsSubmitting(true)
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.selectedSize,
            color: item.selectedColor,
          })),
          customer: shippingData,
          paymentMethod: paymentData.method,
        }),
      })

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}))
        toast.error(data.error ?? "No se pudo crear el pedido. Intenta de nuevo.")
        setIsSubmitting(false)
        return
      }

      const { id } = (await orderRes.json()) as { id: string }

      // Order is created PENDING; start payment and hand off to the gateway.
      // The cart is cleared only once payment succeeds (see the payment page).
      const payRes = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      })

      if (!payRes.ok) {
        const data = await payRes.json().catch(() => ({}))
        toast.error(data.error ?? "No se pudo iniciar el pago. Intenta de nuevo.")
        setIsSubmitting(false)
        return
      }

      const { redirectUrl } = (await payRes.json()) as { redirectUrl: string }
      router.push(redirectUrl)
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">Completa tu pedido en {brand.name}.</p>
        </div>
        <CheckoutProgress currentStep={currentStep} steps={steps} />
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div>
                <h2 className="font-display font-semibold text-xl mb-6">Tu carrito de compras</h2>
                {cartItemsForSummary.length > 0 ? (
                  <>
                    <CartSummary
                      items={cartItemsForSummary}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                      isEditable={true}
                    />
                    <div className="mt-6">
                      <Button onClick={() => setCurrentStep(2)} className="w-full" size="lg">
                        Continuar al envío
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 bg-brand-surface/50 rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto mb-4 text-muted-foreground"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">Tu carrito está vacío</h3>
                    <p className="text-muted-foreground mb-6">
                      Agrega productos para continuar con tu compra
                    </p>
                    <Button onClick={() => router.push(routes.home)} className="px-8">
                      Volver a la tienda
                    </Button>
                  </div>
                )}
              </div>
            )}
            {currentStep === 2 && (
              <ShippingForm
                data={shippingData}
                errors={shippingErrors}
                onUpdate={setShippingData}
                onNext={handleShippingNext}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && (
              <PaymentForm
                data={paymentData}
                errors={paymentErrors}
                onUpdate={setPaymentData}
                onNext={handlePaymentNext}
                onBack={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 4 && (
              <OrderConfirmation
                orderData={{
                  shipping: shippingData,
                  payment: paymentData,
                  items: cartItemsForSummary,
                }}
                onConfirm={handleOrderConfirm}
                onBack={() => setCurrentStep(3)}
              />
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <CartSummary
                items={cartItemsForSummary}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                isEditable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
