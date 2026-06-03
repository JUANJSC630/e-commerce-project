import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react"

async function getDashboardStats() {
  const [
    totalProducts,
    publishedProducts,
    totalOrders,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    cancelledOrders,
    totalUsers,
    revenueData,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isPublished: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  return {
    totalProducts,
    publishedProducts,
    totalOrders,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    cancelledOrders,
    totalUsers,
    revenue: revenueData._sum.total ?? 0,
    recentOrders,
  }
}

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

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const stats = await getDashboardStats()

  const statCards = [
    {
      label: "Ingresos totales",
      value: `$${stats.revenue.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`,
      sub: "pedidos confirmados",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Pedidos",
      value: stats.totalOrders.toString(),
      sub: `${stats.pendingOrders} pendientes`,
      icon: ShoppingBag,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Productos",
      value: stats.totalProducts.toString(),
      sub: `${stats.publishedProducts} publicados`,
      icon: Package,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Usuarios",
      value: stats.totalUsers.toString(),
      sub: "registrados",
      icon: Users,
      color: "text-sky-600 bg-sky-50",
    },
  ]

  const orderStatusCards = [
    {
      label: "Pendientes",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
      href: "/admin/pedidos?status=PENDING",
    },
    {
      label: "Confirmados",
      value: stats.confirmedOrders,
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-50",
      href: "/admin/pedidos?status=CONFIRMED",
    },
    {
      label: "Enviados",
      value: stats.shippedOrders,
      icon: Truck,
      color: "text-indigo-600 bg-indigo-50",
      href: "/admin/pedidos?status=SHIPPED",
    },
    {
      label: "Cancelados",
      value: stats.cancelledOrders,
      icon: XCircle,
      color: "text-red-600 bg-red-50",
      href: "/admin/pedidos?status=CANCELLED",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Bienvenido, {session.user.name ?? session.user.email}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-lg ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order status breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Estado de pedidos
        </h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {orderStatusCards.map((card) => {
            const Icon = card.icon
            return (
              <a
                key={card.label}
                href={card.href}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-indigo-300 transition-colors"
              >
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-500">{card.label}</p>
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Pedidos recientes
          </h2>
          <Link href="/admin/pedidos" className="text-xs text-indigo-600 hover:underline font-medium">
            Ver todos →
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {stats.recentOrders.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">No hay pedidos aún</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-slate-50 transition-colors ${i !== stats.recentOrders.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    <td className="px-4 py-3 text-slate-900">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="hover:text-indigo-600 font-medium"
                      >
                        {order.customerName ?? order.customerEmail ?? "Sin nombre"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      ${order.total.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
