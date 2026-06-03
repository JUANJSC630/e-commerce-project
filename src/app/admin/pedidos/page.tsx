import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import Link from "next/link"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"

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

const ALL_STATUSES = Object.keys(STATUS_LABELS)

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const perms = session.user.role.permissions as Permissions
  if (!hasPermission(perms, "orders", "read")) redirect("/admin")

  const { status, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10))
  const take = 20
  const skip = (page - 1) * take

  const validStatus = status && ALL_STATUSES.includes(status) ? status : undefined

  const where = validStatus ? { status: validStatus as never } : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: { items: { include: { product: { select: { name: true } } } } },
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / take)
  const canUpdate = hasPermission(perms, "orders", "update")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
        <p className="text-slate-500 text-sm mt-0.5">{total} pedidos</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap">
        <Link
          href="/admin/pedidos"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!validStatus ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          Todos
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pedidos?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${validStatus === s ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Items</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Total</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Fecha</th>
                {canUpdate && (
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No hay pedidos
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-slate-50 transition-colors ${i !== orders.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {order.customerName ?? "Sin nombre"}
                      </p>
                      <p className="text-xs text-slate-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {order.items.length} {order.items.length === 1 ? "ítem" : "ítems"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      ${order.total.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    {canUpdate && (
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="text-xs text-indigo-600 hover:underline font-medium"
                        >
                          Ver →
                        </Link>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {(page - 1) * take + 1}–{Math.min(page * take, total)} de {total}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/pedidos?${validStatus ? `status=${validStatus}&` : ""}page=${page - 1}`}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  ← Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/pedidos?${validStatus ? `status=${validStatus}&` : ""}page=${page + 1}`}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Siguiente →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
