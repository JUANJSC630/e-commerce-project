import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { ChevronRight, Package } from "lucide-react"
import { authOptions } from "@/lib/auth-options"
import { getOrdersByUser } from "@/lib/orders"
import { formatPrice } from "@/lib/utils"
import { brand, routes, locale } from "@/config/store.config"
import { OrderStatusBadge } from "@/components/order/order-status-badge"

export const metadata: Metadata = {
  title: `Mis pedidos — ${brand.name}`,
  robots: { index: false, follow: false },
}

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/cuenta/login")

  const orders = await getOrdersByUser(session.user.id)

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Link href={routes.account} className="text-sm text-brand-muted hover:text-brand-base">
        ← Mi cuenta
      </Link>
      <h1 className="font-display font-bold text-3xl text-brand-ink mt-2 mb-8">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
          <div className="rounded-full bg-brand-surface-alt p-6">
            <Package className="h-10 w-10 text-brand-muted" aria-hidden="true" />
          </div>
          <p className="text-brand-muted">Aún no has hecho ningún pedido.</p>
          <Link
            href={routes.products}
            className="px-6 py-3 rounded-xl bg-brand-base text-brand-on-base font-semibold hover:opacity-90 transition-opacity"
          >
            Empezar a comprar
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`${routes.account}/pedidos/${order.id}`}
                className="flex items-center justify-between gap-4 bg-card border border-border rounded-xl p-4 hover:border-brand-base transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-brand-ink">{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-brand-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString(locale.dateLocale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {order.itemCount} {order.itemCount === 1 ? "artículo" : "artículos"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-brand-ink">{formatPrice(order.total)}</span>
                  <ChevronRight className="h-5 w-5 text-brand-muted" aria-hidden="true" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
