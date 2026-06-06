"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Megaphone } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import { SectionCard, Field, Toggle, saveSection } from "./primitives"

export function PromoBannerEditor({ data }: { data: Record<string, unknown> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    enabled: Boolean(data.enabled ?? true),
    message: (data.message as string) ?? "",
    ctaText: (data.ctaText as string) ?? "",
    ctaHref: (data.ctaHref as string) ?? "",
  })
  const [original] = useState(form)
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.promoBanner, form)
        toast.success("Banner promocional actualizado")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={Megaphone}
      title="Banner promocional"
      onSave={handleSave}
      onReset={() => setForm(original)}
      isPending={isPending}
      isDirty={isDirty}
    >
      <Toggle
        label="Activo"
        checked={form.enabled}
        onChange={(v) => setForm({ ...form, enabled: v })}
      />
      <Field
        label="Mensaje"
        value={form.message}
        onChange={(v) => setForm({ ...form, message: v })}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="Texto CTA"
          value={form.ctaText}
          onChange={(v) => setForm({ ...form, ctaText: v })}
          placeholder="Ver ofertas"
        />
        <Field
          label="Enlace CTA"
          value={form.ctaHref}
          onChange={(v) => setForm({ ...form, ctaHref: v })}
          placeholder="/category/sales"
        />
      </div>
    </SectionCard>
  )
}
