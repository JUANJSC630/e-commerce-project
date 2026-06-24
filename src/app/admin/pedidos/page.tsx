import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import Link from "next/link"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import type { Permissions } from "@/lib/permissions"
import { OrdersBulkTable } from "@/components/admin/orders/orders-bulk-table"

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
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
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

      {/* Orders table with bulk actions */}
      <OrdersBulkTable
        orders={orders.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
        }))}
        canUpdate={canUpdate}
        statusLabels={STATUS_LABELS}
        statusColors={STATUS_COLORS}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
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
  )
}
