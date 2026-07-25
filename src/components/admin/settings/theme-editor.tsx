"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Palette, Check, AlertTriangle } from "lucide-react"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import {
  THEME_COLOR_FIELDS,
  THEME_SEMANTIC_FIELDS,
  THEME_PRESETS,
  THEME_DEFAULTS,
  TOAST_POSITIONS,
  type ThemeConfig,
  type ThemeTokens,
  themeVars,
  isValidColor,
} from "@/lib/theme"
import { colorToHex, formatOklch, hexToOklch, contrastRatio } from "@/lib/color"
import { SectionCard, Toggle, saveSection } from "./primitives"

const PALETTE_KEYS = Object.keys(THEME_DEFAULTS) as (keyof ThemeTokens)[]

const TOAST_POSITION_LABELS: Record<(typeof TOAST_POSITIONS)[number], string> = {
  "top-left": "Arriba izquierda",
  "top-center": "Arriba centro",
  "top-right": "Arriba derecha",
  "bottom-left": "Abajo izquierda",
  "bottom-center": "Abajo centro",
  "bottom-right": "Abajo derecha",
}

const TOAST_RADIUS_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "0px", label: "Recto" },
  { value: "0.25rem", label: "Sutil" },
  { value: "0.5rem", label: "Medio" },
  { value: "0.75rem", label: "Redondeado" },
  { value: "1rem", label: "Muy redondeado" },
  { value: "1.5rem", label: "Píldora" },
]

/** Per-type custom toast color fields (bg/text/border keys on ThemeConfig). */
const TOAST_TYPE_FIELDS = [
  { label: "Éxito", bg: "toastSuccessBg", text: "toastSuccessText", border: "toastSuccessBorder" },
  { label: "Error", bg: "toastErrorBg", text: "toastErrorText", border: "toastErrorBorder" },
  { label: "Info", bg: "toastInfoBg", text: "toastInfoText", border: "toastInfoBorder" },
] as const satisfies ReadonlyArray<{
  label: string
  bg: keyof ThemeConfig
  text: keyof ThemeConfig
  border: keyof ThemeConfig
}>

// ─── Two-option segmented control ─────────────────────────────────────────────

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-600 mb-1.5">{label}</div>
      <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              value === opt.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Toast position mini-map: shows the corner the toast will pop from ────────

function ToastPositionPreview({
  position,
  richColors,
}: {
  position: (typeof TOAST_POSITIONS)[number]
  richColors: boolean
}) {
  const [vertical, horizontal] = position.split("-")
  const alignItems = vertical === "top" ? "flex-start" : "flex-end"
  const justifyContent =
    horizontal === "left" ? "flex-start" : horizontal === "right" ? "flex-end" : "center"

  return (
    <div
      aria-hidden="true"
      className="relative mt-2 h-24 rounded-lg border border-slate-200 bg-slate-100 p-2"
      style={{ display: "flex", alignItems, justifyContent }}
    >
      <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[9px] uppercase tracking-wide text-slate-400">
        Tu pantalla
      </span>
      <div
        className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] shadow-sm ${
          richColors
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${richColors ? "bg-emerald-500" : "bg-slate-400"}`}
        />
        Notificación
      </div>
    </div>
  )
}

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

function Preview({ config }: { config: ThemeConfig }) {
  const style = themeVars(config) as React.CSSProperties
  const outline = config.buttonStyle === "outline"
  const softBanner = config.bannerStyle === "soft"

  const ctaStyle: React.CSSProperties = outline
    ? {
        background: "transparent",
        color: "var(--brand-base)",
        border: "1.5px solid var(--brand-base)",
        borderRadius: "var(--radius)",
      }
    : {
        background: "var(--primary)",
        color: "var(--primary-foreground)",
        borderRadius: "var(--radius)",
      }

  return (
    <div
      style={style}
      className="self-start rounded-xl border border-slate-200 overflow-hidden bg-background text-foreground"
    >
      <div
        className="text-xs text-center py-1.5 font-medium"
        style={
          softBanner
            ? {
                background: "color-mix(in oklch, var(--brand-base) 12%, transparent)",
                color: "var(--brand-ink)",
              }
            : { background: "var(--brand-base)", color: "var(--brand-on-base)" }
        }
      >
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
          Así se verá tu tienda. Los cambios se aplican al guardar.
        </p>
        <div
          className="bg-card border border-border p-3 flex items-center justify-between gap-3"
          style={{ borderRadius: "var(--radius)" }}
        >
          <div>
            <div className="text-sm font-medium">Body para bebé</div>
            <div className="text-base font-bold text-primary">$45.000</div>
          </div>
          <button className="text-sm font-medium px-4 py-2" style={ctaStyle}>
            Agregar
          </button>
        </div>
        {/* Semantic colors */}
        <div className="flex gap-2">
          <span
            className="text-[11px] font-medium px-2 py-1 text-white"
            style={{ background: "var(--brand-success)", borderRadius: "var(--radius)" }}
          >
            Disponible
          </span>
          <span
            className="text-[11px] font-medium px-2 py-1 text-white"
            style={{ background: "var(--brand-danger)", borderRadius: "var(--radius)" }}
          >
            Agotado
          </span>
        </div>
        <input
          placeholder="Tu correo…"
          className="w-full bg-background border border-input text-sm px-3 py-2 placeholder:text-muted-foreground"
          style={{ borderRadius: "var(--radius)" }}
          readOnly
        />
      </div>
    </div>
  )
}

// ─── The editor ──────────────────────────────────────────────────────────────

export function ThemeEditor({ data }: { data: ThemeConfig }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<ThemeConfig>(() => ({ ...data }))
  const [original] = useState(() => JSON.stringify(data))
  const isDirty = JSON.stringify(form) !== original

  const allValid = useMemo(
    () =>
      THEME_COLOR_FIELDS.every((f) => isValidColor(form[f.key])) &&
      THEME_SEMANTIC_FIELDS.every((f) => isValidColor(form[f.key])),
    [form],
  )

  const radiusRem = parseFloat(form.radius) || 0
  // Presets only define the palette; compare just those keys so options don't break the match.
  const activePreset = THEME_PRESETS.find((p) => PALETTE_KEYS.every((k) => p.tokens[k] === form[k]))

  function set<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function applyPreset(tokens: ThemeTokens) {
    // Keep the component options (button/banner/toast/semantic) - a preset is a palette.
    setForm((prev) => ({ ...prev, ...tokens }))
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

  // Live preview of the (unsaved) toast look. Position, duration, close button
  // and radius are per-call overridable, so they show instantly; rich colors and
  // expand are Toaster-level and only take effect once saved.
  function previewToast(kind: "success" | "error" | "info") {
    const messages = {
      success: "Cambios guardados con éxito",
      error: "Algo salió mal, intenta de nuevo",
      info: "Así se verán tus notificaciones",
    } as const
    const perType = {
      success: [form.toastSuccessBg, form.toastSuccessText, form.toastSuccessBorder],
      error: [form.toastErrorBg, form.toastErrorText, form.toastErrorBorder],
      info: [form.toastInfoBg, form.toastInfoText, form.toastInfoBorder],
    } as const
    const [bg, text, border] =
      form.toastCustomColors && form.toastPerType
        ? perType[kind]
        : [form.toastBg, form.toastText, form.toastBorder]
    toast[kind](messages[kind], {
      position: form.toastPosition,
      duration: form.toastDuration * 1000,
      closeButton: form.toastCloseButton,
      style: {
        borderRadius: form.toastRadius,
        ...(form.toastCustomColors
          ? {
              backgroundColor: bg,
              color: text,
              borderColor: border,
              borderWidth: 1,
              borderStyle: "solid",
            }
          : {}),
      },
    })
  }

  // Single three-way choice for how toasts are colored, derived from the two
  // stored flags so the UI stays clear (theme / vivid preset / custom).
  const colorMode: "tema" | "vivos" | "custom" = form.toastCustomColors
    ? "custom"
    : form.toastRichColors
      ? "vivos"
      : "tema"

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
                onClick={() => applyPreset(preset.tokens)}
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

          {/* Semantic colors */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="text-xs font-semibold text-slate-700">Colores semánticos</div>
            {THEME_SEMANTIC_FIELDS.map((f) => (
              <ColorRow
                key={f.key}
                label={f.label}
                hint={f.hint}
                value={form[f.key]}
                onChange={(v) => set(f.key, v)}
              />
            ))}
          </div>

          {/* Component options */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="text-xs font-semibold text-slate-700">Componentes</div>
            <Segmented
              label="Estilo de botón"
              value={form.buttonStyle}
              onChange={(v) => set("buttonStyle", v)}
              options={[
                { value: "solid", label: "Relleno" },
                { value: "outline", label: "Contorno" },
              ]}
            />
            <Segmented
              label="Banner de promoción"
              value={form.bannerStyle}
              onChange={(v) => set("bannerStyle", v)}
              options={[
                { value: "solid", label: "Sólido" },
                { value: "soft", label: "Suave" },
              ]}
            />
            <Segmented
              label="Tamaño de las tarjetas de producto"
              value={form.cardSize}
              onChange={(v) => set("cardSize", v)}
              options={[
                { value: "small", label: "Pequeñas" },
                { value: "medium", label: "Medianas" },
                { value: "large", label: "Grandes" },
              ]}
            />
            <div className="space-y-3 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notificaciones (toasts)
                </h4>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => previewToast("success")}
                    className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    Éxito
                  </button>
                  <button
                    type="button"
                    onClick={() => previewToast("error")}
                    className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
                  >
                    Error
                  </button>
                  <button
                    type="button"
                    onClick={() => previewToast("info")}
                    className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    Info
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Posición</label>
                <select
                  value={form.toastPosition}
                  onChange={(e) =>
                    set("toastPosition", e.target.value as ThemeConfig["toastPosition"])
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                >
                  {TOAST_POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {TOAST_POSITION_LABELS[p]}
                    </option>
                  ))}
                </select>
                <ToastPositionPreview
                  position={form.toastPosition}
                  richColors={form.toastRichColors}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Redondez de las esquinas
                </label>
                <select
                  value={form.toastRadius}
                  onChange={(e) => set("toastRadius", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                >
                  {TOAST_RADIUS_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600" htmlFor="toast-duration">
                    Duración en pantalla
                  </label>
                  <span className="text-xs font-semibold text-slate-700">
                    {form.toastDuration}s
                  </span>
                </div>
                <input
                  id="toast-duration"
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={form.toastDuration}
                  onChange={(e) => set("toastDuration", Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-2">
                <Segmented
                  label="Estilo de color"
                  value={colorMode}
                  onChange={(m) => {
                    if (m === "custom") set("toastCustomColors", true)
                    else {
                      set("toastCustomColors", false)
                      set("toastRichColors", m === "vivos")
                    }
                  }}
                  options={[
                    { value: "tema", label: "Tema" },
                    { value: "vivos", label: "Vivos" },
                    { value: "custom", label: "Personalizado" },
                  ]}
                />

                {colorMode === "custom" && (
                  <div className="space-y-2 pl-0.5">
                    <div className="text-[11px] font-semibold text-slate-500">
                      Normal (por defecto)
                    </div>
                    <ColorRow
                      label="Fondo"
                      hint="Fondo del toast"
                      value={form.toastBg}
                      onChange={(v) => set("toastBg", v)}
                    />
                    <ColorRow
                      label="Texto"
                      hint="Texto e íconos"
                      value={form.toastText}
                      onChange={(v) => set("toastText", v)}
                    />
                    <ColorRow
                      label="Borde"
                      hint="Borde del toast"
                      value={form.toastBorder}
                      onChange={(v) => set("toastBorder", v)}
                    />

                    <Toggle
                      label="Un color por tipo (éxito/error/info)"
                      checked={form.toastPerType}
                      onChange={(v) => set("toastPerType", v)}
                    />
                    {form.toastPerType &&
                      TOAST_TYPE_FIELDS.map((t) => (
                        <div
                          key={t.label}
                          className="space-y-1.5 rounded-md border border-slate-100 p-2"
                        >
                          <div className="text-[11px] font-semibold text-slate-500">{t.label}</div>
                          <ColorRow
                            label="Fondo"
                            hint=""
                            value={form[t.bg]}
                            onChange={(v) => set(t.bg, v)}
                          />
                          <ColorRow
                            label="Texto"
                            hint=""
                            value={form[t.text]}
                            onChange={(v) => set(t.text, v)}
                          />
                          <ColorRow
                            label="Borde"
                            hint=""
                            value={form[t.border]}
                            onChange={(v) => set(t.border, v)}
                          />
                        </div>
                      ))}
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <Toggle
                    label="Botón de cerrar (×)"
                    checked={form.toastCloseButton}
                    onChange={(v) => set("toastCloseButton", v)}
                  />
                  <Toggle
                    label="Expandir apiladas"
                    checked={form.toastExpand}
                    onChange={(v) => set("toastExpand", v)}
                  />
                </div>
              </div>

              <p className="text-[11px] leading-snug text-slate-400">
                <strong className="font-medium text-slate-500">Estilo de color:</strong> Tema (usa
                los colores del sitio) · Vivos (verde/rojo/azul) · Personalizado (eliges tú). Los
                botones Éxito/Error/Info prueban todo al instante; “Vivos” y “Expandir apiladas” se
                aplican al guardar y recargar.
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <Preview config={form} />
      </div>
    </SectionCard>
  )
}
