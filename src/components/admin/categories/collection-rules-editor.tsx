"use client"

import { Plus, Trash2 } from "lucide-react"
import type { CollectionCondition, CollectionField, CollectionRules } from "@/lib/collection-rules"

const FIELD_LABELS: Record<CollectionField, string> = {
  onSale: "En oferta",
  new: "Es nuevo",
  featured: "Destacado",
  priceMin: "Precio mínimo ($)",
  priceMax: "Precio máximo ($)",
  category: "Categoría (slug)",
}

const FIELD_ORDER: CollectionField[] = [
  "onSale",
  "new",
  "featured",
  "priceMin",
  "priceMax",
  "category",
]

/** Fields that need a typed value vs. boolean flags (value implicitly true). */
function needsValue(field: CollectionField): "number" | "text" | null {
  if (field === "priceMin" || field === "priceMax") return "number"
  if (field === "category") return "text"
  return null
}

function defaultValue(field: CollectionField): CollectionCondition["value"] {
  const kind = needsValue(field)
  if (kind === "number") return 0
  if (kind === "text") return ""
  return true
}

interface Props {
  value: CollectionRules | null
  onChange: (rules: CollectionRules | null) => void
}

/**
 * Editor for smart-collection rules. Toggling it on makes the category list
 * products matched by conditions (instead of manual assignment); off (or no
 * conditions) keeps it a normal manual category.
 */
export function CollectionRulesEditor({ value, onChange }: Props) {
  const enabled = value !== null

  function enable(on: boolean) {
    onChange(on ? { match: "all", conditions: [{ field: "onSale", value: true }] } : null)
  }

  function update(patch: Partial<CollectionRules>) {
    if (!value) return
    onChange({ ...value, ...patch })
  }

  function setCondition(index: number, field: CollectionField) {
    if (!value) return
    const conditions = value.conditions.map((c, i) =>
      i === index ? { field, value: defaultValue(field) } : c,
    )
    onChange({ ...value, conditions })
  }

  function setConditionValue(index: number, raw: string, kind: "number" | "text") {
    if (!value) return
    const v: CollectionCondition["value"] = kind === "number" ? Number(raw) || 0 : raw
    onChange({
      ...value,
      conditions: value.conditions.map((c, i) => (i === index ? { ...c, value: v } : c)),
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => enable(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span>
          <span className="block text-sm font-semibold text-slate-900">Colección automática</span>
          <span className="block text-xs text-slate-400">
            Lista productos que cumplen condiciones, en vez de asignarlos a mano.
          </span>
        </span>
      </label>

      {enabled && value && (
        <div className="space-y-3 pl-7">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Los productos deben cumplir</span>
            <select
              value={value.match}
              onChange={(e) => update({ match: e.target.value as "all" | "any" })}
              className={selectClass}
            >
              <option value="all">todas las condiciones</option>
              <option value="any">cualquier condición</option>
            </select>
          </div>

          <ul className="space-y-2">
            {value.conditions.map((c, i) => {
              const kind = needsValue(c.field)
              return (
                <li key={i} className="flex items-center gap-2">
                  <select
                    value={c.field}
                    onChange={(e) => setCondition(i, e.target.value as CollectionField)}
                    className={selectClass}
                  >
                    {FIELD_ORDER.map((f) => (
                      <option key={f} value={f}>
                        {FIELD_LABELS[f]}
                      </option>
                    ))}
                  </select>
                  {kind ? (
                    <input
                      type={kind === "number" ? "number" : "text"}
                      value={String(c.value ?? "")}
                      onChange={(e) => setConditionValue(i, e.target.value, kind)}
                      placeholder={kind === "text" ? "slug" : "0"}
                      className={`${selectClass} w-32`}
                    />
                  ) : (
                    <span className="text-sm text-slate-400">= sí</span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      update({ conditions: value.conditions.filter((_, j) => j !== i) })
                    }
                    aria-label="Quitar condición"
                    className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            onClick={() =>
              update({ conditions: [...value.conditions, { field: "new", value: true }] })
            }
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Agregar condición
          </button>
        </div>
      )}
    </div>
  )
}

const selectClass =
  "px-2.5 py-1.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
