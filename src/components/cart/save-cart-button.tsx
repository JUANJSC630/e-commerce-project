"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ListPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/hooks/use-cart"

/**
 * Cart action: save the current cart's products as a named list (a "saved list"
 * for later reorder). Opens a small portal modal for the name and posts the
 * unique product ids to `/api/cuenta/lists`. Portaled to document.body so it is
 * never trapped by an ancestor's stacking context.
 */
export function SaveCartButton() {
  const { items } = useCart()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && setOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, saving])

  function openDialog() {
    setName(`Mi lista · ${new Date().toLocaleDateString()}`)
    setOpen(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const productIds = [...new Set(items.map((i) => i.id))]
    setSaving(true)
    const res = await fetch("/api/cuenta/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, productIds }),
    })
    setSaving(false)

    if (res.status === 401) {
      toast.error("Inicia sesión para guardar tu carrito en una lista")
      return
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo guardar la lista")
      return
    }
    setOpen(false)
    toast.success("Carrito guardado como lista")
  }

  if (items.length === 0) return null

  return (
    <>
      <Button type="button" variant="outline" onClick={openDialog}>
        <ListPlus className="h-4 w-4" aria-hidden="true" />
        Guardar en lista
      </Button>

      {open &&
        createPortal(
          <div
            className="dulce-theme fixed inset-0 z-[70] grid place-items-center bg-brand-ink/50 p-4"
            onClick={() => !saving && setOpen(false)}
          >
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={save}
              className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
              aria-label="Guardar carrito en una lista"
            >
              <h2 className="font-display text-lg font-bold text-brand-ink">
                Guardar en una lista
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                Se guardarán los productos del carrito para volver a comprarlos.
              </p>
              <div className="mt-4">
                <Label htmlFor="list-name">Nombre de la lista</Label>
                <Input
                  id="list-name"
                  autoFocus
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </>
  )
}
