"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ListPlus, Plus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SavedListSummary } from "@/lib/saved-lists"

/**
 * Product action: save this product into one of the customer's saved lists, or
 * a new one. Fetches lists on open (401 → prompt to sign in). The modal is
 * portaled to document.body so it never gets trapped by a stacking context.
 */
export function AddToListButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false)
  const [lists, setLists] = useState<SavedListSummary[] | null>(null)
  const [newName, setNewName] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && setOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, busy])

  async function openDialog() {
    const res = await fetch("/api/cuenta/lists")
    if (res.status === 401) {
      toast.error("Inicia sesión para guardar en listas")
      return
    }
    if (!res.ok) {
      toast.error("No se pudieron cargar tus listas")
      return
    }
    const data = (await res.json()) as { lists: SavedListSummary[] }
    setLists(data.lists)
    setNewName("")
    setOpen(true)
  }

  async function addToExisting(list: SavedListSummary) {
    setBusy(true)
    const res = await fetch(`/api/cuenta/lists/${list.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: [productId] }),
    })
    setBusy(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo añadir a la lista")
      return
    }
    const { added } = (await res.json()) as { added: number }
    toast.success(added > 0 ? `Añadido a "${list.name}"` : `Ya estaba en "${list.name}"`)
    setOpen(false)
  }

  async function createAndAdd(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const res = await fetch("/api/cuenta/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, productIds: [productId] }),
    })
    setBusy(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo crear la lista")
      return
    }
    toast.success(`Lista "${newName.trim()}" creada`)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Guardar en una lista"
        title="Guardar en una lista"
        className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border text-muted-foreground transition-all hover:border-brand-base hover:text-brand-base"
      >
        <ListPlus className="h-5 w-5" aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <div
            className="dulce-theme fixed inset-0 z-[70] grid place-items-center bg-brand-ink/50 p-4"
            onClick={() => !busy && setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Guardar en una lista"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
            >
              <h2 className="font-display text-lg font-bold text-brand-ink">
                Guardar en una lista
              </h2>

              {lists && lists.length > 0 && (
                <ul className="mt-4 max-h-56 space-y-1 overflow-y-auto" role="list">
                  {lists.map((list) => (
                    <li key={list.id}>
                      <button
                        type="button"
                        onClick={() => addToExisting(list)}
                        disabled={busy}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                          "text-brand-ink hover:bg-brand-surface-alt disabled:opacity-50",
                        )}
                      >
                        <span className="truncate font-medium">{list.name}</span>
                        <span className="shrink-0 text-xs text-brand-muted">
                          {list.itemCount} {list.itemCount === 1 ? "producto" : "productos"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={createAndAdd} className="mt-4 border-t border-border pt-4">
                <Label htmlFor="new-list-name">Crear lista nueva</Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    id="new-list-name"
                    required
                    maxLength={80}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Cumpleaños"
                  />
                  <Button type="submit" disabled={busy || !newName.trim()}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Crear
                  </Button>
                </div>
              </form>

              <div className="mt-5 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={busy}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
