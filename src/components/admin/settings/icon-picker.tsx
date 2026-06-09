"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { ICON_NAMES, getLucideIcon } from "@/lib/lucide-icons"

/** Max icons rendered at once — keeps the grid snappy on broad queries. */
const MAX_RESULTS = 120

interface IconPickerProps {
  label?: string
  value: string
  onChange: (name: string) => void
}

/**
 * Searchable Lucide icon picker. A trigger shows the current icon + name; the
 * popover offers a search box and a grid of icon previews. Picking one stores
 * its PascalCase name via `onChange`.
 */
export function IconPicker({ label = "Ícono", value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const Current = getLucideIcon(value)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, "")
    const names = q ? ICON_NAMES.filter((n) => n.toLowerCase().includes(q)) : ICON_NAMES
    return names.slice(0, MAX_RESULTS)
  }, [query])

  // Close on outside click + Escape; focus the search when opening.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    searchRef.current?.focus()
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  function select(name: string) {
    onChange(name)
    setOpen(false)
    setQuery("")
  }

  return (
    <div className="relative" ref={rootRef}>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-800 hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        {Current ? (
          <Current className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <span className="grid h-4 w-4 shrink-0 place-items-center rounded bg-slate-100 text-[9px] text-slate-400">
            ?
          </span>
        )}
        <span className="flex-1 truncate">{value || "Elegir ícono…"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ícono…"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">Sin resultados</p>
            ) : (
              <div className="grid grid-cols-6 gap-1">
                {results.map((name) => {
                  const Icon = getLucideIcon(name)!
                  const isActive = name === value
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => select(name)}
                      title={name}
                      className={`grid aspect-square place-items-center rounded-lg border transition ${
                        isActive
                          ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                          : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {results.length === MAX_RESULTS && (
            <p className="border-t border-slate-100 px-3 py-1.5 text-center text-[11px] text-slate-400">
              Mostrando {MAX_RESULTS} — refina tu búsqueda
            </p>
          )}
        </div>
      )}
    </div>
  )
}
