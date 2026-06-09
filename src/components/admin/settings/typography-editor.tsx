"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Type } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import { SectionCard, saveSection } from "./primitives"
import { FontPicker } from "./font-picker"

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
        <FontPicker
          label="Fuente display (títulos)"
          value={form.displayFont}
          onChange={(v) => setForm({ ...form, displayFont: v })}
        />
        <FontPicker
          label="Fuente body (texto)"
          value={form.bodyFont}
          onChange={(v) => setForm({ ...form, bodyFont: v })}
        />
      </div>
      <p className="text-[11px] text-slate-400">
        Las fuentes se cargan desde Google Fonts y se aplican en vivo a la tienda al guardar.
      </p>
    </SectionCard>
  )
}
