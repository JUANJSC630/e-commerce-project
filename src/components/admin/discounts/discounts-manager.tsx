"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"

interface DiscountDTO {
  id: string
  code: string
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING"
  value: number
  minSubtotal: number | null
  maxRedemptions: number | null
  redemptions: number
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  createdAt: string
}

interface Props {
  initial: DiscountDTO[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

const TYPE_LABELS: Record<DiscountDTO["type"], string> = {
  PERCENTAGE: "% de descuento",
  FIXED: "Monto fijo",
  FREE_SHIPPING: "Envío gratis",
}

export function DiscountsManager({ initial, canCreate, canUpdate, canDelete }: Props) {
  const router = useRouter()
  const [discounts, setDiscounts] = useState(initial)
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as DiscountDTO["type"],
    value: "",
    minSubtotal: "",
    maxRedemptions: "",
  })
  const [loading, setLoading] = useState(false)

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const body = {
      code: form.code,
      type: form.type,
      value: form.type === "FREE_SHIPPING" ? 0 : parseFloat(form.value) || 0,
      minSubtotal: form.minSubtotal ? parseFloat(form.minSubtotal) : null,
      maxRedemptions: form.maxRedemptions ? parseInt(form.maxRedemptions, 10) : null,
      isActive: true,
    }
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "Error al crear el código")
      return
    }
    const created = (await res.json()) as DiscountDTO
    setDiscounts((d) => [created, ...d])
    setForm({ code: "", type: "PERCENTAGE", value: "", minSubtotal: "", maxRedemptions: "" })
    toast.success("Código creado")
    router.refresh()
  }

  async function toggleActive(d: DiscountDTO) {
    const res = await fetch(`/api/admin/discounts/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !d.isActive }),
    })
    if (!res.ok) return toast.error("No se pudo actualizar")
    setDiscounts((list) => list.map((x) => (x.id === d.id ? { ...x, isActive: !x.isActive } : x)))
  }

  async function remove(d: DiscountDTO) {
    if (!confirm(`¿Eliminar el código ${d.code}?`)) return
    const res = await fetch(`/api/admin/discounts/${d.id}`, { method: "DELETE" })
    if (!res.ok && res.status !== 204) return toast.error("No se pudo eliminar")
    setDiscounts((list) => list.filter((x) => x.id !== d.id))
    toast.info("Código eliminado")
  }

  return (
    <div className="space-y-6">
      {canCreate && (
        <form
          onSubmit={create}
          className="bg-white rounded-xl border border-slate-200 p-5 grid gap-3 sm:grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr_auto] sm:items-end"
        >
          <Field label="Código">
            <input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="BIENVENIDA10"
              className={inputClass}
            />
          </Field>
          <Field label="Tipo">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as DiscountDTO["type"] })}
              className={inputClass}
            >
              <option value="PERCENTAGE">% de descuento</option>
              <option value="FIXED">Monto fijo</option>
              <option value="FREE_SHIPPING">Envío gratis</option>
            </select>
          </Field>
          <Field label={form.type === "PERCENTAGE" ? "Porcentaje" : "Valor"}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              disabled={form.type === "FREE_SHIPPING"}
              placeholder={form.type === "FREE_SHIPPING" ? "—" : "10"}
              className={inputClass}
            />
          </Field>
          <Field label="Mín. compra">
            <input
              type="number"
              min="0"
              value={form.minSubtotal}
              onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })}
              placeholder="Opcional"
              className={inputClass}
            />
          </Field>
          <Field label="Máx. usos">
            <input
              type="number"
              min="1"
              value={form.maxRedemptions}
              onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
              placeholder="∞"
              className={inputClass}
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 h-[38px] rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Crear
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Usos</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Aún no hay códigos de descuento.
                </td>
              </tr>
            ) : (
              discounts.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">{d.code}</td>
                  <td className="px-4 py-3 text-slate-600">{TYPE_LABELS[d.type]}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {d.type === "PERCENTAGE"
                      ? `${d.value}%`
                      : d.type === "FIXED"
                        ? `$${d.value.toLocaleString("es-CO")}`
                        : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {d.redemptions}
                    {d.maxRedemptions !== null ? ` / ${d.maxRedemptions}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => canUpdate && toggleActive(d)}
                      disabled={!canUpdate}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      } ${canUpdate ? "cursor-pointer" : "cursor-default"}`}
                    >
                      {d.isActive ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => remove(d)}
                        aria-label={`Eliminar ${d.code}`}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
