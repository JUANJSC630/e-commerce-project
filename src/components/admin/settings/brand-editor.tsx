"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Store } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import { SectionCard, Field, saveSection } from "./primitives"

export function BrandEditor({ data }: { data: Record<string, unknown> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    name: (data.name as string) ?? "",
    tagline: (data.tagline as string) ?? "",
    description: (data.description as string) ?? "",
    logoImage: (data.logoImage as string) ?? "",
    copyright: (data.copyright as string) ?? "",
    footerSubtext: (data.footerSubtext as string) ?? "",
  })
  const [original] = useState(form)
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.brand, { ...form, logoImage: form.logoImage || null })
        toast.success("Marca actualizada")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={Store}
      title="Marca"
      onSave={handleSave}
      onReset={() => setForm(original)}
      isPending={isPending}
      isDirty={isDirty}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field label="Nombre" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field
          label="Tagline"
          value={form.tagline}
          onChange={(v) => setForm({ ...form, tagline: v })}
        />
        <Field
          label="URL logo (dejar vacío para texto)"
          value={form.logoImage}
          onChange={(v) => setForm({ ...form, logoImage: v })}
          placeholder="/logo.png"
        />
        <Field
          label="Copyright"
          value={form.copyright}
          onChange={(v) => setForm({ ...form, copyright: v })}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Field
          label="Descripción"
          value={form.description}
          onChange={(v) => setForm({ ...form, description: v })}
        />
        <Field
          label="Texto secundario footer"
          value={form.footerSubtext}
          onChange={(v) => setForm({ ...form, footerSubtext: v })}
        />
      </div>
    </SectionCard>
  )
}
