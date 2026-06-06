"use client"

import { useId } from "react"
import { RotateCcw, Save } from "lucide-react"

/** Card shell shared by every settings section: header, save/undo, body. */
export function SectionCard({
  icon: Icon,
  title,
  children,
  onSave,
  onReset,
  isPending,
  isDirty,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  onSave: () => void
  onReset: () => void
  isPending: boolean
  isDirty: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={onReset}
              disabled={isPending}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Deshacer
            </button>
          )}
          <button
            onClick={onSave}
            disabled={isPending || !isDirty}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
          >
            <Save className="h-3 w-3" />
            {isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  )
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  type?: "text" | "number"
  placeholder?: string
}) {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
      />
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-slate-200"}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[2px]"}`}
        />
      </button>
    </div>
  )
}

/** PUT a single settings section; throws with the API error message on failure. */
export async function saveSection(key: string, value: unknown) {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? "Error al guardar")
  }
}
