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
  Save,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"

interface SettingsEditorProps {
  settings: {
    brand: Record<string, unknown>
    locale: Record<string, unknown>
    shipping: Record<string, unknown>
    paymentMethods: Array<{ id: string; name: string; description: string }>
    promoBanner: Record<string, unknown>
    social: Record<string, unknown>
    contact: Record<string, unknown>
    theme: Record<string, unknown>
    typography: Record<string, unknown>
  }
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
    </div>
  )
}

// ─── Generic Section Wrapper ──────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  children,
  onSave,
  onReset,
  isPending,
  isDirty,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  onSave: () => void
  onReset: () => void
  isPending: boolean
  isDirty: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              onClick={onReset}
              disabled={isPending}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Deshacer
            </button>
          )}
          <button
            onClick={onSave}
            disabled={isPending || !isDirty}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
          >
            <Save className="h-3 w-3" />
            {isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  )
}

let fieldIdCounter = 0

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (val: string) => void
  type?: "text" | "number"
  placeholder?: string
}) {
  const [id] = useState(() => `settings-field-${++fieldIdCounter}`)

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
      />
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-slate-200"}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[2px]"}`}
        />
      </button>
    </div>
  )
}

// ─── Save helper ──────────────────────────────────────────────────────────────

async function saveSection(key: string, value: unknown) {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? "Error al guardar")
  }
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
