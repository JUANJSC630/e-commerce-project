"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
}

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: string
  currentCarrier?: string | null
  currentTracking?: string | null
}

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentCarrier,
  currentTracking,
}: OrderStatusUpdaterProps) {
  const router = useRouter()
  const [selected, setSelected] = useState(currentStatus)
  const [carrier, setCarrier] = useState(currentCarrier ?? "")
  const [tracking, setTracking] = useState(currentTracking ?? "")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const dirty =
    selected !== currentStatus ||
    carrier !== (currentCarrier ?? "") ||
    tracking !== (currentTracking ?? "")

  async function handleUpdate() {
    if (!dirty) return
    setError(null)
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: selected, carrier, trackingNumber: tracking }),
    })
    if (!res.ok) {
      setError("Error al actualizar el pedido")
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="font-semibold text-slate-900 mb-3">Actualizar estado y envío</h2>
      <div className="space-y-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        {/* Tracking - relevant when shipping. Saved with the status. */}
        <div className="grid grid-cols-2 gap-3">
          <input
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="Transportadora"
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Número de guía"
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <p className="text-xs text-slate-400">
          La guía se incluye en el email cuando el pedido pasa a “Enviado”.
        </p>

        <button
          onClick={handleUpdate}
          disabled={isPending || !dirty}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
