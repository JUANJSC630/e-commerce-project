"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CreditCard, Plus, Trash2 } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import { SectionCard, Field, saveSection } from "./primitives"

export function PaymentMethodsEditor({
  data,
}: {
  data: Array<{ id: string; name: string; description: string }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [methods, setMethods] = useState(data.map((m) => ({ ...m })))
  const [original] = useState(methods)
  const isDirty = JSON.stringify(methods) !== JSON.stringify(original)

  function updateMethod(index: number, field: string, value: string) {
    setMethods((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }

  function addMethod() {
    setMethods((prev) => [...prev, { id: `method_${Date.now()}`, name: "", description: "" }])
  }

  function removeMethod(index: number) {
    setMethods((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.paymentMethods, methods)
        toast.success("Métodos de pago actualizados")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={CreditCard}
      title="Métodos de pago"
      onSave={handleSave}
      onReset={() => setMethods(original)}
      isPending={isPending}
      isDirty={isDirty}
    >
      <div className="space-y-3">
        {methods.map((method, i) => (
          <div key={method.id} className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
              <Field label="ID" value={method.id} onChange={(v) => updateMethod(i, "id", v)} />
              <Field
                label="Nombre"
                value={method.name}
                onChange={(v) => updateMethod(i, "name", v)}
              />
              <Field
                label="Descripción"
                value={method.description}
                onChange={(v) => updateMethod(i, "description", v)}
              />
            </div>
            <button
              onClick={() => removeMethod(i)}
              className="mt-6 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addMethod}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <Plus className="h-4 w-4" />
          Agregar método
        </button>
      </div>
    </SectionCard>
  )
}
