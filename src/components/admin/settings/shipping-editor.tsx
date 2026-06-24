"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Truck, Plus, Trash2 } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import { SectionCard, Field, saveSection } from "./primitives"

interface ZoneRow {
  name: string
  states: string
  cost: string
}

export function ShippingEditor({ data }: { data: Record<string, unknown> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    freeThreshold: String(data.freeThreshold ?? "150000"),
    standardCost: String(data.standardCost ?? "10000"),
    estimatedDays: (data.estimatedDays as string) ?? "",
    taxRate: String(data.taxRate ?? "0"),
    taxIncluded: data.taxIncluded !== false,
  })
  const [zones, setZones] = useState<ZoneRow[]>(
    Array.isArray(data.zones)
      ? (data.zones as { name?: string; states?: string[]; cost?: number }[]).map((z) => ({
          name: z.name ?? "",
          states: (z.states ?? []).join(", "),
          cost: String(z.cost ?? 0),
        }))
      : [],
  )
  const [original] = useState({ form, zones })
  const isDirty = JSON.stringify({ form, zones }) !== JSON.stringify(original)

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.shipping, {
          freeThreshold: Number(form.freeThreshold),
          standardCost: Number(form.standardCost),
          estimatedDays: form.estimatedDays,
          taxRate: Number(form.taxRate) || 0,
          taxIncluded: form.taxIncluded,
          zones: zones
            .filter((z) => z.name.trim() && z.states.trim())
            .map((z) => ({
              name: z.name.trim(),
              states: z.states
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              cost: Number(z.cost) || 0,
            })),
        })
        toast.success("Envíos actualizados")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={Truck}
      title="Envíos e impuestos"
      onSave={handleSave}
      onReset={() => {
        setForm(original.form)
        setZones(original.zones)
      }}
      isPending={isPending}
      isDirty={isDirty}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field
          label="Envío gratis desde ($)"
          value={form.freeThreshold}
          onChange={(v) => setForm({ ...form, freeThreshold: v })}
          type="number"
        />
        <Field
          label="Costo estándar ($)"
          value={form.standardCost}
          onChange={(v) => setForm({ ...form, standardCost: v })}
          type="number"
        />
        <Field
          label="Tiempo estimado"
          value={form.estimatedDays}
          onChange={(v) => setForm({ ...form, estimatedDays: v })}
          placeholder="3-5 días hábiles"
        />
      </div>

      {/* Tax */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <Field
          label="IVA (%)"
          value={form.taxRate}
          onChange={(v) => setForm({ ...form, taxRate: v })}
          type="number"
        />
        <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2 pb-2">
          <input
            type="checkbox"
            checked={form.taxIncluded}
            onChange={(e) => setForm({ ...form, taxIncluded: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Los precios ya incluyen el IVA (se muestra como “IVA incluido”)
        </label>
      </div>

      {/* Zones */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-700">
            Zonas de envío (por departamento)
          </h3>
          <button
            type="button"
            onClick={() => setZones([...zones, { name: "", states: "", cost: "" }])}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar zona
          </button>
        </div>
        {zones.length === 0 ? (
          <p className="text-xs text-slate-400">
            Sin zonas. Todos los envíos usan el costo estándar.
          </p>
        ) : (
          <ul className="space-y-2">
            {zones.map((z, i) => (
              <li key={i} className="grid grid-cols-[1fr_1.5fr_0.8fr_auto] gap-2 items-center">
                <input
                  value={z.name}
                  onChange={(e) =>
                    setZones(zones.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                  placeholder="Nombre (ej. Bogotá)"
                  className={inputClass}
                />
                <input
                  value={z.states}
                  onChange={(e) =>
                    setZones(zones.map((x, j) => (j === i ? { ...x, states: e.target.value } : x)))
                  }
                  placeholder="Departamentos (coma): Cundinamarca, Boyacá"
                  className={inputClass}
                />
                <input
                  type="number"
                  value={z.cost}
                  onChange={(e) =>
                    setZones(zones.map((x, j) => (j === i ? { ...x, cost: e.target.value } : x)))
                  }
                  placeholder="Costo"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setZones(zones.filter((_, j) => j !== i))}
                  aria-label="Quitar zona"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  )
}

const inputClass =
  "w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
