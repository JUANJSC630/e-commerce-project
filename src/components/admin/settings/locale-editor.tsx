"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Globe } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import { SectionCard, Field, saveSection } from "./primitives"

export function LocaleEditor({ data }: { data: Record<string, unknown> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    language: (data.language as string) ?? "es",
    currency: (data.currency as string) ?? "COP",
    currencySymbol: (data.currencySymbol as string) ?? "$",
    defaultCountry: (data.defaultCountry as string) ?? "",
    dateLocale: (data.dateLocale as string) ?? "es-CO",
  })
  const [original] = useState(form)
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.locale, form)
        toast.success("Localización actualizada")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={Globe}
      title="Localización y moneda"
      onSave={handleSave}
      onReset={() => setForm(original)}
      isPending={isPending}
      isDirty={isDirty}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Field
          label="Idioma (HTML lang)"
          value={form.language}
          onChange={(v) => setForm({ ...form, language: v })}
        />
        <Field
          label="Código moneda (ISO)"
          value={form.currency}
          onChange={(v) => setForm({ ...form, currency: v })}
        />
        <Field
          label="Símbolo moneda"
          value={form.currencySymbol}
          onChange={(v) => setForm({ ...form, currencySymbol: v })}
        />
        <Field
          label="País por defecto"
          value={form.defaultCountry}
          onChange={(v) => setForm({ ...form, defaultCountry: v })}
        />
        <Field
          label="Locale fechas"
          value={form.dateLocale}
          onChange={(v) => setForm({ ...form, dateLocale: v })}
        />
      </div>
    </SectionCard>
  )
}
