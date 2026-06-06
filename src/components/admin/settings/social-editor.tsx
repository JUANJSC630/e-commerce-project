"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Share2 } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import { SectionCard, Field, saveSection } from "./primitives"

export function SocialEditor({ data }: { data: Record<string, unknown> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    instagram: (data.instagram as string) ?? "",
    facebook: (data.facebook as string) ?? "",
    whatsapp: (data.whatsapp as string) ?? "",
    tiktok: (data.tiktok as string) ?? "",
  })
  const [original] = useState(form)
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.social, form)
        toast.success("Redes sociales actualizadas")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={Share2}
      title="Redes sociales"
      onSave={handleSave}
      onReset={() => setForm(original)}
      isPending={isPending}
      isDirty={isDirty}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="Instagram"
          value={form.instagram}
          onChange={(v) => setForm({ ...form, instagram: v })}
          placeholder="@dulceinfancia"
        />
        <Field
          label="Facebook"
          value={form.facebook}
          onChange={(v) => setForm({ ...form, facebook: v })}
          placeholder="https://facebook.com/..."
        />
        <Field
          label="WhatsApp"
          value={form.whatsapp}
          onChange={(v) => setForm({ ...form, whatsapp: v })}
          placeholder="+57 300 123 4567"
        />
        <Field
          label="TikTok"
          value={form.tiktok}
          onChange={(v) => setForm({ ...form, tiktok: v })}
          placeholder="@dulceinfancia"
        />
      </div>
    </SectionCard>
  )
}
