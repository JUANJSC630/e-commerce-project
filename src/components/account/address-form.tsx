"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddressSelectors, type AddressValue } from "@/components/checkout/address-selectors"
import type { Address } from "@/lib/addresses"

type FormState = {
  label: string
  recipientName: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  isDefault: boolean
}

function toForm(a: Address | null): FormState {
  return {
    label: a?.label ?? "",
    recipientName: a?.recipientName ?? "",
    phone: a?.phone ?? "",
    address: a?.address ?? "",
    city: a?.city ?? "",
    state: a?.state ?? "",
    country: a?.country ?? "",
    zipCode: a?.zipCode ?? "",
    isDefault: a?.isDefault ?? false,
  }
}

interface AddressFormProps {
  /** Address being edited, or `null` to create a new one. */
  address?: Address | null
  onSaved: (address: Address) => void
  onCancel: () => void
}

/**
 * Create/edit form for a saved address. Reuses the checkout `AddressSelectors`
 * (country → state → city, geo-seeded) and posts to `/api/cuenta/addresses`.
 */
export function AddressForm({ address = null, onSaved, onCancel }: AddressFormProps) {
  const [form, setForm] = useState<FormState>(() => toForm(address))
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(address)

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const patchLocation = (patch: Partial<AddressValue>) => setForm((f) => ({ ...f, ...patch }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(
      isEdit ? `/api/cuenta/addresses/${address!.id}` : "/api/cuenta/addresses",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    )
    setSaving(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo guardar la dirección")
      return
    }

    const data = (await res.json()) as { address: Address }
    toast.success(isEdit ? "Dirección actualizada" : "Dirección añadida")
    onSaved(data.address)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="label">Etiqueta</Label>
          <Input
            id="label"
            value={form.label}
            onChange={set("label")}
            placeholder="Casa, Oficina…"
          />
        </div>
        <div>
          <Label htmlFor="recipientName">Nombre de quien recibe</Label>
          <Input id="recipientName" value={form.recipientName} onChange={set("recipientName")} />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Dirección *</Label>
        <Input
          id="address"
          required
          value={form.address}
          onChange={set("address")}
          placeholder="Carrera 00 # 00-00, barrio, apto…"
        />
      </div>

      <AddressSelectors
        value={{ country: form.country, state: form.state, city: form.city }}
        onChange={patchLocation}
        zipField={
          <div>
            <Label htmlFor="zipCode">Código postal</Label>
            <Input
              id="zipCode"
              inputMode="numeric"
              value={form.zipCode}
              onChange={set("zipCode")}
            />
          </div>
        }
      />

      <div>
        <Label htmlFor="phone">Teléfono de contacto</Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          placeholder="300 000 0000"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-ink">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          className="h-4 w-4 rounded border-input accent-brand-base"
        />
        Usar como dirección principal
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Añadir dirección"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
