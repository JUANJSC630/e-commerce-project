"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Type } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import { SectionCard, Field, saveSection } from "./primitives"

export function TypographyEditor({ data }: { data: Record<string, unknown> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    displayFont: (data.displayFont as string) ?? "",
    bodyFont: (data.bodyFont as string) ?? "",
  })
  const [original] = useState(form)
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.typography, form)
        toast.success("Tipografía actualizada")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={Type}
      title="Tipografía"
      onSave={handleSave}
      onReset={() => setForm(original)}
      isPending={isPending}
      isDirty={isDirty}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="Fuente display (títulos)"
          value={form.displayFont}
          onChange={(v) => setForm({ ...form, displayFont: v })}
          placeholder="Nunito"
        />
        <Field
          label="Fuente body (texto)"
          value={form.bodyFont}
          onChange={(v) => setForm({ ...form, bodyFont: v })}
          placeholder="Atkinson Hyperlegible"
        />
      </div>
      <p className="text-[11px] text-slate-400">
        Nota: el cambio de fuente en vivo requiere cargarla; hoy se aplican Nunito + Atkinson
        Hyperlegible (limitación de next/font).
      </p>
    </SectionCard>
  )
}
