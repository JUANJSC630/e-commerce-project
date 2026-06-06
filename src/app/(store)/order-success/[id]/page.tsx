import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { getOrderForConfirmation } from "@/lib/orders"
import { brand, routes } from "@/config/store.config"
import { OrderSummary } from "@/components/order/order-summary"

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: `Pedido confirmado — ${brand.name}`,
  robots: { index: false, follow: false },
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { id } = await params
  const order = await getOrderForConfirmation(id)

  if (!order) notFound()
  // Only celebrate a paid order; otherwise send the customer to complete payment.
  if (order.paymentStatus !== "PAID") redirect(`/pago/${id}`)

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <header className="text-center mb-10">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-brand-base/10">
          <CheckCircle2 className="h-9 w-9 text-brand-base" aria-hidden="true" />
        </div>
        <h1 className="font-display font-bold text-3xl text-brand-ink">¡Gracias por tu compra!</h1>
        <p className="text-brand-muted mt-2">
          Tu pedido <span className="font-semibold text-brand-ink">{order.orderNumber}</span> fue
          recibido. Te enviaremos un correo con los detalles
          {order.customerEmail ? ` a ${order.customerEmail}` : ""}.
        </p>
      </header>

      <OrderSummary order={order} />

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link
          href={routes.products}
          className="px-6 py-3 rounded-xl bg-brand-base text-brand-on-base font-semibold text-center hover:opacity-90 transition-opacity"
        >
          Seguir comprando
        </Link>
        <Link
          href={routes.home}
          className="px-6 py-3 rounded-xl border border-border text-brand-ink font-medium text-center hover:bg-brand-surface transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
