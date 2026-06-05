import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, Package, MapPin } from "lucide-react"
import { getOrderForConfirmation } from "@/lib/orders"
import { formatPrice } from "@/lib/utils"
import { brand, routes, shipping as shippingConfig } from "@/config/store.config"

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

  const { shippingAddress: address } = order

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      {/* Header */}
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

      {/* Items */}
      <section
        aria-labelledby="items-heading"
        className="bg-card border border-border rounded-xl p-5 mb-5"
      >
        <h2
          id="items-heading"
          className="flex items-center gap-2 font-semibold text-brand-ink mb-4"
        >
          <Package className="h-5 w-5 text-brand-base" aria-hidden="true" />
          Resumen del pedido
        </h2>
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-surface">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="flex flex-1 justify-between gap-3">
                <div>
                  <p className="font-medium text-brand-ink leading-tight">{item.name}</p>
                  <p className="text-sm text-brand-muted mt-0.5">
                    {[item.size, item.color].filter(Boolean).join(" • ") || "Estándar"} · Cant:{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-brand-ink whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-brand-muted">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-brand-muted">Envío</dt>
            <dd>{order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</dd>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t border-border pt-2">
            <dt>Total</dt>
            <dd className="text-brand-base">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>

      {/* Shipping */}
      {address && (
        <section
          aria-labelledby="shipping-heading"
          className="bg-card border border-border rounded-xl p-5 mb-8"
        >
          <h2
            id="shipping-heading"
            className="flex items-center gap-2 font-semibold text-brand-ink mb-3"
          >
            <MapPin className="h-5 w-5 text-brand-base" aria-hidden="true" />
            Envío a
          </h2>
          <address className="not-italic text-sm text-brand-muted leading-relaxed">
            <span className="text-brand-ink font-medium">
              {address.firstName} {address.lastName}
            </span>
            <br />
            {address.address}, {address.city}
            {address.state ? `, ${address.state}` : ""}
            <br />
            {address.country}
            {address.phone ? ` · ${address.phone}` : ""}
            <br />
            <span className="text-xs">Entrega estimada: {shippingConfig.estimatedDays}</span>
          </address>
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
