"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Search, X, Check } from "lucide-react"
import { GOOGLE_FONTS, fontFamilyWithFallback, googleFontsHref } from "@/lib/google-fonts"

interface FontPickerProps {
  label: string
  value: string
  onChange: (name: string) => void
}

/** Injects (once) a stylesheet that loads every catalog font for previews. */
function usePreviewFontsLoaded(active: boolean) {
  useEffect(() => {
    if (!active) return
    const id = "font-picker-previews"
    if (document.getElementById(id)) return
    const href = googleFontsHref(
      GOOGLE_FONTS.map((f) => f.name),
      "400;700",
    )
    if (!href) return
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = href
    document.head.appendChild(link)
  }, [active])
}

/**
 * Searchable Google Fonts picker. The trigger shows the current font in its own
 * typeface; the popover lets you search and preview each family rendered in
 * itself. Selecting stores the family name via `onChange`.
 */
export function FontPicker({ label, value, onChange }: FontPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  usePreviewFontsLoaded(open)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GOOGLE_FONTS
    return GOOGLE_FONTS.filter((f) => f.name.toLowerCase().includes(q))
  }, [query])

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
        <span
          className="flex-1 truncate text-base"
          style={value ? { fontFamily: fontFamilyWithFallback(value) } : undefined}
        >
          {value || "Elegir fuente…"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar fuente…"
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

          <div className="max-h-72 overflow-y-auto p-1.5">
            {results.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">Sin resultados</p>
            ) : (
              results.map((font) => {
                const isActive = font.name === value
                return (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => select(font.name)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition ${
                      isActive ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className="truncate text-base text-slate-800"
                      style={{ fontFamily: fontFamilyWithFallback(font.name) }}
                    >
                      {font.name}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">
                        {font.category}
                      </span>
                      {isActive && <Check className="h-4 w-4 text-indigo-600" />}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
