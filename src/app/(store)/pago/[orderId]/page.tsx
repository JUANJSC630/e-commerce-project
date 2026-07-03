import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { ShieldCheck } from "lucide-react"
import { MAX_PAYMENT_ATTEMPTS, getOrderPaymentInfo, getOrderForConfirmation } from "@/lib/orders"
import { getPaymentProvider, isMockPaymentsEnabled } from "@/lib/payments"
import { authOptions } from "@/lib/auth-options"
import { formatPrice } from "@/lib/utils"
import { loadAllSettings } from "@/lib/settings"
import { privatePageMetadata } from "@/lib/seo"
import { SimulatedPaymentActions } from "@/components/checkout/simulated-payment-actions"
import { MercadoPagoCheckout } from "@/components/payment/mercadopago-checkout"
import { OrderSummary } from "@/components/order/order-summary"

interface PageProps {
  params: Promise<{ orderId: string }>
}

export function generateMetadata(): Promise<Metadata> {
  return privatePageMetadata("Pago")
}

export default async function PaymentPage({ params }: PageProps) {
  const { orderId } = await params
  const session = await getServerSession(authOptions)
  const [order, summary, { locale }] = await Promise.all([
    getOrderPaymentInfo(orderId),
    // Order breakdown for the summary column. Same link-as-capability trust as
    // the payment info: guests see their own order via the unguessable id; an
    // account order returns null to a non-owner and the form just renders alone.
    getOrderForConfirmation(orderId, session?.user?.id),
    loadAllSettings(),
  ])

  if (!order) notFound()
  if (order.paymentStatus === "PAID") redirect(`/order-success/${orderId}`)
  if (order.paymentStatus === "FAILED") redirect(`/pago-fallido?orderId=${orderId}`)
  // PSE in flight: the success page shows the waiting state (webhook settles it).
  if (order.paymentStatus === "PROCESSING") redirect(`/order-success/${orderId}`)

  if (getPaymentProvider().name === "mercadopago") {
    if (order.paymentAttempts >= MAX_PAYMENT_ATTEMPTS) {
      return (
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <h1 className="font-display font-bold text-2xl text-brand-ink">
            Límite de intentos alcanzado
          </h1>
          <p className="text-brand-muted mt-2">
            Este pedido alcanzó el máximo de intentos de pago. Escríbenos y te ayudamos a completar
            tu compra.
          </p>
        </div>
      )
    }

    const checkout = (
      <MercadoPagoCheckout
        orderId={order.id}
        orderNumber={order.orderNumber}
        amount={order.total}
        {...(order.paymentMethod ? { preferredMethod: order.paymentMethod } : {})}
      />
    )

    // Rectangular two-column layout: the order breakdown (what they're paying
    // for, with their details) sits beside the payment form on desktop and
    // stacks above it on mobile. Falls back to a centered single column when the
    // summary isn't available (e.g. an account order opened by a non-owner).
    if (!summary) {
      return <div className="container mx-auto px-4 py-12 max-w-md">{checkout}</div>
    }

    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <OrderSummary order={summary} />
          </aside>
          <div>{checkout}</div>
        </div>
      </div>
    )
  }

  // Simulated gateway - only exists while the mock provider is active.
  if (!isMockPaymentsEnabled()) notFound()

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-700 mb-6">
        Pago simulado · entorno de pruebas (sin MercadoPago)
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-base/10">
          <ShieldCheck className="h-7 w-7 text-brand-base" aria-hidden="true" />
        </div>
        <h1 className="font-display font-bold text-2xl text-brand-ink">Confirmar pago</h1>
        <p className="text-sm text-brand-muted mt-1">
          Pedido <span className="font-medium text-brand-ink">{order.orderNumber}</span>
        </p>

        <p className="text-4xl font-bold text-brand-ink my-6">{formatPrice(order.total, locale)}</p>

        <SimulatedPaymentActions orderId={order.id} successHref={`/order-success/${order.id}`} />

        <p className="text-xs text-brand-muted mt-4">
          Elige un resultado para simular la respuesta de la pasarela de pago.
        </p>
      </div>
    </div>
  )
}
