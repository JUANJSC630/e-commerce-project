"use client"

import { CreditCard, Landmark } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFormatPrice } from "@/components/providers/settings-provider"
import { MpCardForm } from "./mp-card-form"
import { PseForm } from "./pse-form"

interface MercadoPagoCheckoutProps {
  orderId: string
  orderNumber: string
  amount: number
  /** Method chosen during checkout — preselects the matching tab. */
  preferredMethod?: string
}

/** Payment hub for an order: card (CardForm) and PSE, side by side. */
export function MercadoPagoCheckout({
  orderId,
  orderNumber,
  amount,
  preferredMethod,
}: MercadoPagoCheckoutProps) {
  const formatPrice = useFormatPrice()
  const defaultTab = preferredMethod === "pse" ? "pse" : "card"

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="text-center mb-6">
        <h1 className="font-display font-bold text-2xl text-brand-ink">Completa tu pago</h1>
        <p className="text-sm text-brand-muted mt-1">
          Pedido <span className="font-medium text-brand-ink">{orderNumber}</span>
        </p>
        <p className="text-3xl font-bold text-brand-ink mt-4">{formatPrice(amount)}</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="card">
            <CreditCard className="w-4 h-4 mr-2" aria-hidden="true" />
            Tarjeta
          </TabsTrigger>
          <TabsTrigger value="pse">
            <Landmark className="w-4 h-4 mr-2" aria-hidden="true" />
            PSE
          </TabsTrigger>
        </TabsList>
        <TabsContent value="card">
          <MpCardForm orderId={orderId} amount={amount} />
        </TabsContent>
        <TabsContent value="pse">
          <PseForm orderId={orderId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
