"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { CheckoutProgress } from "@/components/checkout/checkout-progress"
import { CartSummary } from "@/components/checkout/cart-summary"
import { ShippingForm } from "@/components/checkout/shipping-form"
import { PaymentForm } from "@/components/checkout/payment-form"
import { OrderConfirmation } from "@/components/checkout/order-confirmation"

// Mock data
const mockCartItems = [
  {
    id: "1",
    name: "Vestido Floral Bebé",
    image: "/placeholder.svg",
    price: 35000,
    quantity: 1,
    size: "6M",
    color: "Rosa",
  },
  {
    id: "2",
    name: "Conjunto Deportivo Niño",
    image: "/placeholder.svg",
    price: 45000,
    quantity: 2,
    size: "4T",
    color: "Azul",
  },
]
const steps = ["Carrito", "Envío", "Pago", "Confirmación"]

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [cartItems, setCartItems] = useState(mockCartItems)
  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Colombia",
  })
  const [paymentData, setPaymentData] = useState<{
    method: "card" | "mercadopago" | "bank";
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardName: string;
  }>({
    method: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })

  const handleUpdateQuantity = (id: string, quantity: number) =>
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  const handleRemoveItem = (id: string) => setCartItems((items) => items.filter((item) => item.id !== id))
  const handleOrderConfirm = () => {
    alert("¡Pedido confirmado! Recibirás un email de confirmación.")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-montserrat font-bold text-3xl mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">Completa tu pedido en Dulce Infancia.</p>
        </div>
        <CheckoutProgress currentStep={currentStep} steps={steps} />
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div>
                <h2 className="font-montserrat font-semibold text-xl mb-6">Tu carrito de compras</h2>
                <CartSummary
                  items={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  isEditable={true}
                />
                <div className="mt-6">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="w-full"
                    size="lg"
                    disabled={cartItems.length === 0}
                  >
                    Continuar al envío
                  </Button>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <ShippingForm
                data={shippingData}
                onUpdate={setShippingData}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && (
              <PaymentForm
                data={paymentData}
                onUpdate={setPaymentData}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 4 && (
              <OrderConfirmation
                orderData={{ shipping: shippingData, payment: paymentData, items: mockCartItems }}
                onConfirm={handleOrderConfirm}
                onBack={() => setCurrentStep(3)}
              />
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <CartSummary
                items={cartItems}
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
