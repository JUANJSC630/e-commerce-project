import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { OrderStatusUpdater } from "@/components/admin/orders/order-status-updater"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: "Pago pendiente",
  PAID: "Pagado",
  FAILED: "Pago fallido",
}

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
}

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "orders", "read")) redirect("/admin")

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, image: true } },
        },
      },
    },
  })

  if (!order) notFound()

  const canUpdate = hasPermission(perms, "orders", "update")

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <Link href="/admin/pedidos" className="text-sm text-slate-500 hover:text-indigo-600">
          ← Volver a pedidos
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-slate-900">Pedido {order.orderNumber}</h1>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${PAYMENT_COLORS[order.paymentStatus]}`}
            >
              {PAYMENT_LABELS[order.paymentStatus]}
            </span>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-1">{order.id}</p>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-3">Cliente</h2>
        <dl className="space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-slate-500 w-24">Nombre:</dt>
            <dd className="text-slate-900">{order.customerName ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-slate-500 w-24">Email:</dt>
            <dd className="text-slate-900">{order.customerEmail ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-slate-500 w-24">Fecha:</dt>
            <dd className="text-slate-900">{new Date(order.createdAt).toLocaleString("es-AR")}</dd>
          </div>
        </dl>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Productos</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="px-5 py-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-12 w-12 rounded-lg object-cover bg-slate-100"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                <p className="text-xs text-slate-400">
                  {item.size && `Talla: ${item.size}`}
                  {item.size && item.color && " · "}
                  {item.color && `Color: ${item.color}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-slate-900">
                  x{item.quantity} · ${(item.price * item.quantity).toLocaleString("es-AR")}
                </p>
                <p className="text-xs text-slate-400">${item.price.toLocaleString("es-AR")} c/u</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-sm space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>${order.subtotal.toLocaleString("es-AR")}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Envío</span>
            <span>
              {order.shippingCost === 0
                ? "Gratis"
                : `$${order.shippingCost.toLocaleString("es-AR")}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
            <span>Total</span>
            <span>${order.total.toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>

      {/* Status updater */}
      {canUpdate && <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />}
    </div>
  )
}
