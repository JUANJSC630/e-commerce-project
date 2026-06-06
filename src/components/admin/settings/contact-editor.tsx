"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Mail } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import { SectionCard, Field, saveSection } from "./primitives"

export function ContactEditor({ data }: { data: Record<string, unknown> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    email: (data.email as string) ?? "",
    phone: (data.phone as string) ?? "",
    address: (data.address as string) ?? "",
  })
  const [original] = useState(form)
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.contact, form)
        toast.success("Contacto actualizado")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={Mail}
      title="Contacto"
      onSave={handleSave}
      onReset={() => setForm(original)}
      isPending={isPending}
      isDirty={isDirty}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field
          label="Email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="hola@dulceinfancia.com"
        />
        <Field
          label="Teléfono"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="+57 300 123 4567"
        />
        <Field
          label="Dirección"
          value={form.address}
          onChange={(v) => setForm({ ...form, address: v })}
          placeholder="Bogotá, Colombia"
        />
      </div>
    </SectionCard>
  )
}
