"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { AddressCard } from "@/components/account/address-card"
import { AddressForm } from "@/components/account/address-form"
import type { Address } from "@/lib/addresses"

/** Editing target: an existing address, the sentinel "new", or none (list view). */
type FormFor = Address | "new" | null

/** Account "Direcciones" tab: lists saved addresses and manages add/edit/delete. */
export function AddressesSection({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [formFor, setFormFor] = useState<FormFor>(null)
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Re-read the list after any mutation so `isDefault` stays consistent (setting
  // one default clears the others, deleting the default promotes another).
  async function refresh() {
    const res = await fetch("/api/cuenta/addresses")
    if (res.ok) {
      const data = (await res.json()) as { addresses: Address[] }
      setAddresses(data.addresses)
    }
  }

  async function handleSaved() {
    setFormFor(null)
    await refresh()
  }

  async function handleSetDefault(address: Address) {
    const res = await fetch(`/api/cuenta/addresses/${address.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "default" }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo marcar como principal")
      return
    }
    toast.success("Dirección principal actualizada")
    await refresh()
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/cuenta/addresses/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo eliminar la dirección")
      return
    }
    setDeleteTarget(null)
    toast.success("Dirección eliminada")
    await refresh()
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-brand-ink">Direcciones</h1>
        {!formFor && addresses.length > 0 && (
          <Button type="button" onClick={() => setFormFor("new")}>
            Añadir dirección
          </Button>
        )}
      </header>

      {formFor ? (
        <AddressForm
          address={formFor === "new" ? null : formFor}
          onSaved={handleSaved}
          onCancel={() => setFormFor(null)}
        />
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-14 text-center">
          <div className="rounded-full bg-brand-surface-alt p-6">
            <MapPin className="h-10 w-10 text-brand-muted" aria-hidden="true" />
          </div>
          <p className="text-brand-muted">Aún no tienes direcciones guardadas.</p>
          <Button type="button" onClick={() => setFormFor("new")}>
            Añadir dirección
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={setFormFor}
              onSetDefault={handleSetDefault}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="¿Eliminar dirección?"
        description="Se quitará de tu libreta de direcciones."
        confirmLabel={deleting ? "Eliminando…" : "Eliminar"}
        destructive
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}
