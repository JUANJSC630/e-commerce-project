import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { getCustomerOrder } from "@/lib/orders"
import { loadAllSettings } from "@/lib/settings"
import { brand, routes } from "@/config/store.config"
import { OrderStatusBadge } from "@/components/order/order-status-badge"
import { OrderSummary } from "@/components/order/order-summary"

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: `Detalle del pedido — ${brand.name}`,
  robots: { index: false, follow: false },
}

export default async function CustomerOrderDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/cuenta/login")

  const { id } = await params
  const [order, { locale }] = await Promise.all([
    getCustomerOrder(id, session.user.id),
    loadAllSettings(),
  ])
  if (!order) notFound()

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Link
        href={`${routes.account}/pedidos`}
        className="text-sm text-brand-muted hover:text-brand-base"
      >
        ← Mis pedidos
      </Link>

      <header className="flex items-center justify-between gap-4 mt-2 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-brand-ink">{order.orderNumber}</h1>
          <p className="text-sm text-brand-muted mt-1">
            {new Date(order.createdAt).toLocaleDateString(locale.dateLocale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <OrderSummary order={order} />
    </div>
  )
}
