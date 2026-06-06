import Image from "next/image"
import { Package, MapPin } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { shipping as shippingConfig } from "@/config/store.config"
import type { OrderConfirmationDTO } from "@/lib/orders"

interface OrderSummaryProps {
  order: OrderConfirmationDTO
  /** Show the shipping address block (hidden where it's redundant). */
  showShipping?: boolean
}

/** Reusable order breakdown: items, totals and (optionally) the shipping address. */
export function OrderSummary({ order, showShipping = true }: OrderSummaryProps) {
  const { shippingAddress: address } = order

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="order-items-heading"
        className="bg-card border border-border rounded-xl p-5"
      >
        <h2
          id="order-items-heading"
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

      {showShipping && address && (
        <section
          aria-labelledby="order-shipping-heading"
          className="bg-card border border-border rounded-xl p-5"
        >
          <h2
            id="order-shipping-heading"
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
    </div>
  )
}
