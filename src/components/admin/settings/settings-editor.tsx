"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Store,
  Globe,
  Palette,
  Truck,
  CreditCard,
  Megaphone,
  Type,
  Share2,
  Mail,
  Plus,
  Trash2,
} from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import type { StoreSettings } from "@/lib/settings"
import { SectionCard, Field, Toggle, saveSection } from "./primitives"
import { HomeContentEditor } from "./home-content-editor"

interface SettingsEditorProps {
  settings: StoreSettings
}

export function SettingsEditor({ settings }: SettingsEditorProps) {
  return (
    <div className="space-y-6">
      <BrandEditor data={settings.brand} />
      <LocaleEditor data={settings.locale} />
      <ThemeEditor data={settings.theme} />
      <TypographyEditor data={settings.typography} />
      <ShippingEditor data={settings.shipping} />
      <PaymentMethodsEditor data={settings.paymentMethods} />
      <PromoBannerEditor data={settings.promoBanner} />
      <SocialEditor data={settings.social} />
      <ContactEditor data={settings.contact} />
      <HomeContentEditor data={settings.homeContent} />
    </div>
  )
}

// ─── Brand Editor ─────────────────────────────────────────────────────────────

function BrandEditor({ data }: { data: Record<string, unknown> }) {
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
        await saveSection(SETTINGS_KEYS.brand, {
          ...form,
          logoImage: form.logoImage || null,
        })
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    </SectionCard>
  )
}

// ─── Locale Editor ────────────────────────────────────────────────────────────

function LocaleEditor({ data }: { data: Record<string, unknown> }) {
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

// ─── Theme Editor ─────────────────────────────────────────────────────────────

function ThemeEditor({ data }: { data: Record<string, unknown> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    base: (data.base as string) ?? "",
    onBase: (data.onBase as string) ?? "",
    surface: (data.surface as string) ?? "",
    surfaceAlt: (data.surfaceAlt as string) ?? "",
    muted: (data.muted as string) ?? "",
    ink: (data.ink as string) ?? "",
  })
  const [original] = useState(form)
  const isDirty = JSON.stringify(form) !== JSON.stringify(original)

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSection(SETTINGS_KEYS.theme, form)
        toast.success("Tema visual actualizado")
        router.refresh()
      } catch (e) {
        toast.error((e as Error).message)
      }
    })
  }

  return (
    <SectionCard
      icon={Palette}
      title="Tema visual (colores OKLCH)"
      onSave={handleSave}
      onReset={() => setForm(original)}
      isPending={isPending}
      isDirty={isDirty}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(form).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-md border border-slate-200 shrink-0"
              style={{ background: value }}
            />
            <Field
              label={key}
              value={value}
              onChange={(v) => setForm({ ...form, [key]: v })}
              placeholder="oklch(0.68 0.08 145)"
            />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Typography Editor ────────────────────────────────────────────────────────

function TypographyEditor({ data }: { data: Record<string, unknown> }) {
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
    </SectionCard>
  )
}

// ─── Shipping Editor ──────────────────────────────────────────────────────────

function ShippingEditor({ data }: { data: Record<string, unknown> }) {
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

// ─── Payment Methods Editor ───────────────────────────────────────────────────

function PaymentMethodsEditor({
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

// ─── Promo Banner Editor ──────────────────────────────────────────────────────

function PromoBannerEditor({ data }: { data: Record<string, unknown> }) {
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

// ─── Social Editor ────────────────────────────────────────────────────────────

function SocialEditor({ data }: { data: Record<string, unknown> }) {
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

// ─── Contact Editor ───────────────────────────────────────────────────────────

function ContactEditor({ data }: { data: Record<string, unknown> }) {
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
