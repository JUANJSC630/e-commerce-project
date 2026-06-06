"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Palette, Check, AlertTriangle } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import {
  THEME_COLOR_FIELDS,
  THEME_PRESETS,
  type ThemeTokens,
  themeVars,
  isValidColor,
} from "@/lib/theme"
import { colorToHex, formatOklch, hexToOklch, contrastRatio } from "@/lib/color"
import { SectionCard, saveSection } from "./primitives"

// ─── One color token: swatch + native picker + advanced OKLCH field ──────────

function ColorRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
}) {
  const valid = isValidColor(value)
  const hex = colorToHex(value)

  return (
    <div className="flex items-center gap-3">
      <label
        className="relative h-10 w-10 shrink-0 rounded-lg border border-slate-200 overflow-hidden cursor-pointer"
        title="Elegir color"
      >
        <span className="absolute inset-0" style={{ background: valid ? value : "#000" }} />
        <input
          type="color"
          value={hex}
          onChange={(e) => {
            const oklch = hexToOklch(e.target.value)
            if (oklch) onChange(formatOklch(oklch))
          }}
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          aria-label={label}
        />
      </label>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-700">{label}</div>
        <div className="text-[11px] text-slate-400 truncate">{hint}</div>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className={`w-44 px-2.5 py-1.5 border rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 ${
          valid
            ? "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-400"
            : "border-red-300 focus:ring-red-500/20 bg-red-50"
        }`}
        aria-invalid={!valid}
      />
    </div>
  )
}

// ─── Contrast badge (WCAG AA needs ≥ 4.5 for body text) ──────────────────────

function ContrastBadge({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  const ratio = contrastRatio(fg, bg)
  const pass = ratio >= 4.5
  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md ${
        pass ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {pass ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      <span>
        {label}: {ratio}:1 {pass ? "AA" : "bajo"}
      </span>
    </div>
  )
}

// ─── Live preview (uses the same Tailwind tokens as the storefront) ──────────

function Preview({ tokens }: { tokens: ThemeTokens }) {
  const style = themeVars(tokens) as React.CSSProperties
  return (
    <div
      style={style}
      className="self-start rounded-xl border border-slate-200 overflow-hidden bg-background text-foreground"
    >
      <div className="bg-primary text-primary-foreground text-xs text-center py-1.5 font-medium">
        🚚 Envío gratis en compras mayores a $150.000
      </div>
      <div className="p-4 space-y-3" style={{ borderRadius: "var(--radius)" }}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">Vista previa</span>
          <span
            className="text-[11px] px-2 py-0.5 bg-secondary text-secondary-foreground"
            style={{ borderRadius: "var(--radius)" }}
          >
            Nuevo
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Así se verá tu tienda con estos colores. Los cambios se aplican al guardar.
        </p>
        <div
          className="bg-card border border-border p-3 flex items-center justify-between gap-3"
          style={{ borderRadius: "var(--radius)" }}
        >
          <div>
            <div className="text-sm font-medium">Body para bebé</div>
            <div className="text-base font-bold text-primary">$45.000</div>
          </div>
          <button
            className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2"
            style={{ borderRadius: "var(--radius)" }}
          >
            Agregar
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 border border-border text-foreground text-sm py-2"
            style={{ borderRadius: "var(--radius)" }}
          >
            Secundario
          </button>
          <input
            placeholder="Tu correo…"
            className="flex-1 bg-background border border-input text-sm px-3 py-2 placeholder:text-muted-foreground"
            style={{ borderRadius: "var(--radius)" }}
            readOnly
          />
        </div>
      </div>
    </div>
  )
}

// ─── The editor ──────────────────────────────────────────────────────────────

export function ThemeEditor({ data }: { data: ThemeTokens }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<ThemeTokens>(() => ({ ...data }))
  const [original] = useState(() => JSON.stringify(data))
  const isDirty = JSON.stringify(form) !== original

  const allValid = useMemo(() => THEME_COLOR_FIELDS.every((f) => isValidColor(form[f.key])), [form])

  const radiusRem = parseFloat(form.radius) || 0
  const activePreset = THEME_PRESETS.find((p) => JSON.stringify(p.tokens) === JSON.stringify(form))

  function set(key: keyof ThemeTokens, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!allValid) {
      toast.error("Revisa los colores: hay valores no válidos")
      return
    }
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
      title="Tema visual"
      onSave={handleSave}
      onReset={() => setForm(JSON.parse(original))}
      isPending={isPending}
      isDirty={isDirty}
    >
      {/* Presets */}
      <div>
        <div className="text-xs font-medium text-slate-600 mb-1.5">Plantillas</div>
        <div className="flex flex-wrap gap-2">
          {THEME_PRESETS.map((preset) => {
            const isActive = activePreset?.id === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setForm({ ...preset.tokens })}
                className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  isActive
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="flex -space-x-1">
                  {[preset.tokens.base, preset.tokens.surface, preset.tokens.ink].map((c, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-full border border-white"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                {preset.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        {/* Controls */}
        <div className="space-y-3">
          {THEME_COLOR_FIELDS.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              hint={f.hint}
              value={form[f.key]}
              onChange={(v) => set(f.key, v)}
            />
          ))}

          {/* Radius */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-700">Esquinas redondeadas</span>
              <span className="text-[11px] font-mono text-slate-500">{form.radius}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.125}
              value={radiusRem}
              onChange={(e) => set("radius", `${e.target.value}rem`)}
              className="w-full accent-indigo-600"
              aria-label="Radio de las esquinas"
            />
          </div>

          {/* Contrast */}
          <div className="flex flex-wrap gap-2 pt-1">
            <ContrastBadge label="Botón" fg={form.onBase} bg={form.base} />
            <ContrastBadge label="Texto" fg={form.ink} bg={form.surface} />
          </div>
        </div>

        {/* Preview */}
        <Preview tokens={form} />
      </div>
    </SectionCard>
  )
}
