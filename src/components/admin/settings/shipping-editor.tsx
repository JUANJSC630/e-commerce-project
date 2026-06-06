"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Truck } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import { SectionCard, Field, saveSection } from "./primitives"

export function ShippingEditor({ data }: { data: Record<string, unknown> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    freeThreshold: String(data.freeThreshold ?? "150000"),
    standardCost: String(data.standardCost ?? "10000"),
    estimatedDays: (data.estimatedDays as string) ?? "",
  })
  const [original] = useState(form)
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.shipping, {
          freeThreshold: Number(form.freeThreshold),
          standardCost: Number(form.standardCost),
          estimatedDays: form.estimatedDays,
        })
        toast.success("Envíos actualizados")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={Truck}
      title="Envíos"
      onSave={handleSave}
      onReset={() => setForm(original)}
      isPending={isPending}
      isDirty={isDirty}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field
          label="Envío gratis desde ($)"
          value={form.freeThreshold}
          onChange={(v) => setForm({ ...form, freeThreshold: v })}
          type="number"
        />
        <Field
          label="Costo estándar ($)"
          value={form.standardCost}
          onChange={(v) => setForm({ ...form, standardCost: v })}
          type="number"
        />
        <Field
          label="Tiempo estimado"
          value={form.estimatedDays}
          onChange={(v) => setForm({ ...form, estimatedDays: v })}
          placeholder="3-5 días hábiles"
        />
      </div>
    </SectionCard>
  )
}
