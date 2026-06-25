"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface OrderRow {
  id: string
  orderNumber: string
  customerName: string | null
  customerEmail: string | null
  total: number
  status: string
  createdAt: string
  _count: { items: number }
}

interface OrdersBulkTableProps {
  orders: OrderRow[]
  canUpdate: boolean
  statusLabels: Record<string, string>
  statusColors: Record<string, string>
}

export function OrdersBulkTable({
  orders,
  canUpdate,
  statusLabels,
  statusColors,
}: OrdersBulkTableProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [bulkStatus, setBulkStatus] = useState("")

  const allSelected = orders.length > 0 && selected.size === orders.length
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(orders.map((o) => o.id)))
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleBulkUpdate() {
    if (!bulkStatus || selected.size === 0) return
    const ids = Array.from(selected)
    const res = await fetch("/api/admin/orders/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status: bulkStatus }),
    })
    if (res.ok) {
      setSelected(new Set())
      setBulkStatus("")
      startTransition(() => router.refresh())
    }
  }

  return (
    <>
      {/* Bulk action bar */}
      {canUpdate && someSelected && (
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
          <span className="text-sm font-medium text-indigo-700">
            {selected.size} {selected.size === 1 ? "pedido seleccionado" : "pedidos seleccionados"}
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Cambiar estado a…</option>
            {Object.entries(statusLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkUpdate}
            disabled={!bulkStatus || isPending}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Aplicando…" : "Aplicar"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-indigo-600 hover:underline"
          >
            Deseleccionar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {canUpdate && (
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected
                      }}
                      onChange={toggleAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      aria-label="Seleccionar todos"
                    />
                  </th>
                )}
                <th className="text-left px-4 py-3 font-medium text-slate-500">Pedido</th>
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
                  <td colSpan={canUpdate ? 8 : 6} className="text-center py-10 text-slate-400">
                    No hay pedidos
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-slate-50 transition-colors ${i !== orders.length - 1 ? "border-b border-slate-100" : ""} ${selected.has(order.id) ? "bg-indigo-50/50" : ""}`}
                  >
                    {canUpdate && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(order.id)}
                          onChange={() => toggle(order.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          aria-label={`Seleccionar ${order.orderNumber}`}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {order.customerName ?? "Sin nombre"}
                      </p>
                      <p className="text-xs text-slate-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {order._count.items} {order._count.items === 1 ? "ítem" : "ítems"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      ${order.total.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}
                      >
                        {statusLabels[order.status]}
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
      </div>
    </>
  )
}
