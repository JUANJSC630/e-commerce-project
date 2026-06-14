"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Menu, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import type { NavItem } from "@/config/store.config"
import { SectionCard, saveSection } from "./primitives"

const HREF_SUGGESTIONS = [
  "/products",
  "/category/sales",
  "/category/essentials",
  "/favoritos",
  "/search",
]

export function MenuEditor({ data }: { data: NavItem[] }) {
  const router = useRouter()
  const listId = useId()
  const [isPending, startTransition] = useTransition()
  const [links, setLinks] = useState<NavItem[]>(() => data.map((l) => ({ ...l })))
  const [original] = useState(() => JSON.stringify(data))
  const isDirty = JSON.stringify(links) !== original

  const update = (i: number, patch: Partial<NavItem>) =>
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const remove = (i: number) => setLinks((prev) => prev.filter((_, idx) => idx !== i))
  const add = () => setLinks((prev) => [...prev, { label: "", href: "" }])
  const move = (i: number, dir: -1 | 1) =>
    setLinks((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  function handleSave() {
    const cleaned = links
      .map((l) => ({ label: l.label.trim(), href: l.href.trim() }))
      .filter((l) => l.label && l.href)
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.headerLinks, cleaned)
        toast.success("Menú actualizado")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={Menu}
      title="Menú del encabezado"
      onSave={handleSave}
      onReset={() => setLinks(JSON.parse(original))}
      isPending={isPending}
      isDirty={isDirty}
    >
      <p className="text-sm text-slate-500 -mt-1">
        Enlaces que aparecen en la barra superior, junto a “Categorías”. Las categorías de productos
        se gestionan aparte y salen automáticamente en el menú “Categorías”.
      </p>

      <datalist id={listId}>
        {HREF_SUGGESTIONS.map((h) => (
          <option key={h} value={h} />
        ))}
      </datalist>

      {links.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
          Sin enlaces. Agrega el primero.
        </p>
      ) : (
        <ul className="space-y-2.5" role="list">
          {links.map((link, i) => (
            <li
              key={i}
              className="flex flex-col sm:flex-row sm:items-end gap-2 rounded-xl border border-slate-200 p-3"
            >
              <label className="flex-1 min-w-0">
                <span className="block text-xs font-medium text-slate-600 mb-1">Texto</span>
                <input
                  value={link.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="Novedades"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </label>
              <label className="flex-1 min-w-0">
                <span className="block text-xs font-medium text-slate-600 mb-1">Destino</span>
                <input
                  value={link.href}
                  onChange={(e) => update(i, { href: e.target.value })}
                  list={listId}
                  placeholder="/category/sales"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </label>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Subir"
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === links.length - 1}
                  aria-label="Bajar"
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Eliminar enlace"
                  className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" />
        Agregar enlace
      </button>
    </SectionCard>
  )
}
