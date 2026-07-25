"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GENDERS, GENDER_LABELS, type Profile } from "@/lib/account-types"

/** Shape the form edits: everything the API accepts, as controlled strings. */
type FormState = {
  name: string
  lastName: string
  docId: string
  gender: string
  birthDate: string
  phone: string
}

function toForm(p: Profile): FormState {
  return {
    name: p.name ?? "",
    lastName: p.lastName ?? "",
    docId: p.docId ?? "",
    gender: p.gender ?? "",
    birthDate: p.birthDate ?? "",
    phone: p.phone ?? "",
  }
}

const selectClass =
  "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"

/**
 * Read-only view of the customer profile that flips to an edit form via
 * "Editar". Saving PATCHes `/api/cuenta/profile`; on success it refreshes the
 * server tree so the sidebar greeting reflects a changed name.
 */
export function ProfileSection({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(() => toForm(profile))

  const set =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  function cancel() {
    setForm(toForm(profile))
    setEditing(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/cuenta/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "No se pudo actualizar el perfil")
      return
    }

    const data = (await res.json()) as { profile: Profile }
    setForm(toForm(data.profile))
    setEditing(false)
    toast.success("Perfil actualizado")
    router.refresh() // keep the sidebar greeting in sync with a new name
  }

  const disabled = !editing

  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-brand-ink">Perfil</h1>
        {!editing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="text-brand-base"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Editar
          </Button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <Field label="Nombre" htmlFor="name">
          <Input id="name" value={form.name} onChange={set("name")} disabled={disabled} required />
        </Field>
        <Field label="Apellido" htmlFor="lastName">
          <Input
            id="lastName"
            value={form.lastName}
            onChange={set("lastName")}
            disabled={disabled}
          />
        </Field>

        <Field label="Email" htmlFor="email" className="md:col-span-2">
          {/* Identity: never editable from here. */}
          <Input id="email" type="email" value={profile.email} disabled readOnly />
        </Field>

        <Field label="Documento" htmlFor="docId">
          <Input
            id="docId"
            inputMode="numeric"
            value={form.docId}
            onChange={set("docId")}
            disabled={disabled}
            placeholder={disabled ? "—" : "Cédula de ciudadanía"}
          />
        </Field>
        <Field label="Género" htmlFor="gender">
          <select
            id="gender"
            value={form.gender}
            onChange={set("gender")}
            disabled={disabled}
            className={selectClass}
          >
            <option value="">Sin especificar</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABELS[g]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fecha de nacimiento" htmlFor="birthDate">
          <Input
            id="birthDate"
            type="date"
            value={form.birthDate}
            onChange={set("birthDate")}
            disabled={disabled}
            max={new Date().toISOString().slice(0, 10)}
          />
        </Field>
        <Field label="Teléfono" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            disabled={disabled}
            placeholder={disabled ? "—" : "300 000 0000"}
          />
        </Field>

        {editing && (
          <div className="flex gap-3 md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
            <Button type="button" variant="outline" onClick={cancel} disabled={saving}>
              Cancelar
            </Button>
          </div>
        )}
      </form>
    </section>
  )
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string
  htmlFor: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-1.5 text-brand-muted">
        {label}
      </Label>
      {children}
    </div>
  )
}
