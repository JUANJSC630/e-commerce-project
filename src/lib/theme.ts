/**
 * Theme tokens, presets, validation and CSS generation for the storefront.
 *
 * Security: the editor only ever stores validated color/length values. Before a
 * value reaches the injected `<style>`, `isValidColor`/`isValidRadius` reject
 * anything that isn't a plain color or length literal - there is no path for
 * arbitrary CSS (no `;`, `{`, `}`, `url(...)`, etc.), so the theme cannot be
 * used for CSS/style injection.
 */

import { brandColors } from "@/config/theme.config"
import { radius as radiusConfig } from "@/config/theme.config"

export interface ThemeTokens {
  /** Primary accent - buttons, links, active states */
  base: string
  /** Foreground on top of `base` */
  onBase: string
  /** Page / card background */
  surface: string
  /** Deeper surface - sections, inputs, borders */
  surfaceAlt: string
  /** Muted tone - secondary text, subtle icons */
  muted: string
  /** Ink - headings, body text, dark surfaces */
  ink: string
  /** Corner radius (rem/px/em), e.g. "0.625rem" */
  radius: string
}

/** Canonical defaults (used as the merge base for the DB `theme` setting). */
export const THEME_DEFAULTS: ThemeTokens = {
  base: brandColors.base,
  onBase: brandColors.onBase,
  surface: brandColors.surface,
  surfaceAlt: brandColors.surfaceAlt,
  muted: brandColors.muted,
  ink: brandColors.ink,
  radius: radiusConfig.base,
}

// ─── Fase 4: per-component options (success/danger + UI behaviour) ─────────────

export const BUTTON_STYLES = ["solid", "outline"] as const
export const BANNER_STYLES = ["solid", "soft"] as const
export const CARD_SIZES = ["small", "medium", "large"] as const
export const TOAST_POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const

export type ButtonStyle = (typeof BUTTON_STYLES)[number]
export type BannerStyle = (typeof BANNER_STYLES)[number]
export type ToastPosition = (typeof TOAST_POSITIONS)[number]
export type CardSize = (typeof CARD_SIZES)[number]

/** Product grid columns per card size - denser size = smaller cards. */
export const PRODUCT_GRID_CLASS: Record<CardSize, string> = {
  small: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  medium: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  large: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3",
}

/** Semantic colors + behavioural options layered on top of the 6-color palette. */
export interface ThemeOptions {
  /** Success accent - confirmations, "in stock", positive toasts */
  success: string
  /** Danger accent - errors, "out of stock", destructive actions */
  danger: string
  /** Default look of primary CTAs across the storefront */
  buttonStyle: ButtonStyle
  /** Promo banner fill: bold (solid) or subtle (soft) */
  bannerStyle: BannerStyle
  /** Where toasts appear */
  toastPosition: ToastPosition
  /** Sonner's per-type accent colors */
  toastRichColors: boolean
  /** Product card density across listing grids */
  cardSize: CardSize
}

export const THEME_OPTION_DEFAULTS: ThemeOptions = {
  success: "oklch(0.6 0.13 150)",
  danger: "oklch(0.58 0.22 27)",
  buttonStyle: "solid",
  bannerStyle: "solid",
  toastPosition: "top-right",
  toastRichColors: true,
  cardSize: "medium",
}

/** The full theme stored in the `theme` setting: palette + options. */
export type ThemeConfig = ThemeTokens & ThemeOptions

export const THEME_CONFIG_DEFAULTS: ThemeConfig = {
  ...THEME_DEFAULTS,
  ...THEME_OPTION_DEFAULTS,
}

/** Editor metadata for the two semantic colors. */
export const THEME_SEMANTIC_FIELDS = [
  { key: "success", label: "Éxito", hint: "Confirmaciones, disponible" },
  { key: "danger", label: "Peligro", hint: "Errores, agotado" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<ThemeOptions, "success" | "danger">
  label: string
  hint: string
}>

/** Editor metadata: ordered, labelled, with a hint of where each token shows. */
export const THEME_COLOR_FIELDS = [
  { key: "base", label: "Acento principal", hint: "Botones, enlaces, precios" },
  { key: "onBase", label: "Texto sobre el acento", hint: "Etiqueta de botones" },
  { key: "surface", label: "Fondo", hint: "Fondo de página y tarjetas" },
  { key: "surfaceAlt", label: "Fondo secundario", hint: "Secciones, inputs, bordes" },
  { key: "muted", label: "Tenue", hint: "Texto secundario, íconos" },
  { key: "ink", label: "Tinta", hint: "Títulos, texto, footer" },
] as const satisfies ReadonlyArray<{
  key: keyof Omit<ThemeTokens, "radius">
  label: string
  hint: string
}>

/** One-click starting points. Built-ins, not editable/deletable. */
export const THEME_PRESETS: ReadonlyArray<{ id: string; name: string; tokens: ThemeTokens }> = [
  {
    id: "dulce",
    name: "Dulce Infancia",
    tokens: { ...THEME_DEFAULTS },
  },
  {
    id: "pastel",
    name: "Pastel",
    tokens: {
      base: "oklch(0.74 0.12 20)",
      onBase: "oklch(0.99 0 0)",
      surface: "oklch(0.97 0.015 330)",
      surfaceAlt: "oklch(0.93 0.03 330)",
      muted: "oklch(0.6 0.03 330)",
      ink: "oklch(0.27 0.04 350)",
      radius: "1rem",
    },
  },
  {
    id: "ocean",
    name: "Océano",
    tokens: {
      base: "oklch(0.6 0.12 230)",
      onBase: "oklch(0.99 0 0)",
      surface: "oklch(0.97 0.012 230)",
      surfaceAlt: "oklch(0.92 0.025 230)",
      muted: "oklch(0.56 0.03 230)",
      ink: "oklch(0.24 0.04 250)",
      radius: "0.5rem",
    },
  },
  {
    id: "vibrant",
    name: "Vibrante",
    tokens: {
      base: "oklch(0.68 0.2 300)",
      onBase: "oklch(0.99 0 0)",
      surface: "oklch(0.98 0.005 300)",
      surfaceAlt: "oklch(0.93 0.02 300)",
      muted: "oklch(0.55 0.04 300)",
      ink: "oklch(0.22 0.05 300)",
      radius: "0.75rem",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    tokens: {
      base: "oklch(0.45 0.02 260)",
      onBase: "oklch(0.99 0 0)",
      surface: "oklch(0.99 0 0)",
      surfaceAlt: "oklch(0.95 0.003 260)",
      muted: "oklch(0.6 0.01 260)",
      ink: "oklch(0.2 0.01 260)",
      radius: "0.375rem",
    },
  },
  {
    id: "bosque",
    name: "Bosque",
    tokens: {
      base: "oklch(0.52 0.12 150)",
      onBase: "oklch(0.99 0 0)",
      surface: "oklch(0.97 0.012 150)",
      surfaceAlt: "oklch(0.92 0.026 150)",
      muted: "oklch(0.54 0.03 150)",
      ink: "oklch(0.23 0.03 150)",
      radius: "0.625rem",
    },
  },
  {
    id: "atardecer",
    name: "Atardecer",
    tokens: {
      base: "oklch(0.64 0.16 45)",
      onBase: "oklch(0.99 0 0)",
      surface: "oklch(0.98 0.018 60)",
      surfaceAlt: "oklch(0.93 0.035 55)",
      muted: "oklch(0.57 0.04 50)",
      ink: "oklch(0.26 0.045 40)",
      radius: "0.875rem",
    },
  },
  {
    id: "lavanda",
    name: "Lavanda",
    tokens: {
      base: "oklch(0.58 0.13 295)",
      onBase: "oklch(0.99 0 0)",
      surface: "oklch(0.98 0.012 300)",
      surfaceAlt: "oklch(0.93 0.026 300)",
      muted: "oklch(0.57 0.03 300)",
      ink: "oklch(0.26 0.04 300)",
      radius: "1rem",
    },
  },
  {
    id: "cereza",
    name: "Cereza",
    tokens: {
      base: "oklch(0.55 0.19 25)",
      onBase: "oklch(0.99 0 0)",
      surface: "oklch(0.98 0.01 25)",
      surfaceAlt: "oklch(0.93 0.022 25)",
      muted: "oklch(0.55 0.04 25)",
      ink: "oklch(0.24 0.05 20)",
      radius: "0.625rem",
    },
  },
  {
    id: "menta",
    name: "Menta",
    tokens: {
      base: "oklch(0.62 0.1 185)",
      onBase: "oklch(0.99 0 0)",
      surface: "oklch(0.98 0.014 185)",
      surfaceAlt: "oklch(0.93 0.028 185)",
      muted: "oklch(0.55 0.03 185)",
      ink: "oklch(0.24 0.03 195)",
      radius: "0.75rem",
    },
  },
  {
    id: "arena",
    name: "Arena",
    tokens: {
      base: "oklch(0.58 0.07 60)",
      onBase: "oklch(0.99 0 0)",
      surface: "oklch(0.97 0.022 75)",
      surfaceAlt: "oklch(0.92 0.032 75)",
      muted: "oklch(0.54 0.025 70)",
      ink: "oklch(0.26 0.025 60)",
      radius: "0.5rem",
    },
  },
  {
    id: "carbon",
    name: "Carbón",
    tokens: {
      base: "oklch(0.72 0.15 255)",
      onBase: "oklch(0.16 0.02 255)",
      surface: "oklch(0.23 0.012 260)",
      surfaceAlt: "oklch(0.29 0.016 260)",
      muted: "oklch(0.68 0.02 260)",
      ink: "oklch(0.95 0.005 260)",
      radius: "0.625rem",
    },
  },
]

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * True only for plain color literals: #rrggbb, oklch(), rgb()/rgba(), hsl()/hsla().
 * Deliberately strict - the character set forbids anything that could break out
 * of a `--token: value;` declaration.
 */
export function isValidColor(value: unknown): value is string {
  if (typeof value !== "string") return false
  const v = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return true
  if (/^oklch\(\s*[\d.%]+\s+[\d.]+\s+[\d.]+(\s*\/\s*[\d.%]+)?\s*\)$/.test(v)) return true
  if (/^rgba?\(\s*[\d.,%\s/]+\)$/.test(v)) return true
  if (/^hsla?\(\s*[\d.,%\s/]+\)$/.test(v)) return true
  return false
}

/** True for a bare CSS length: number + rem|px|em. */
export function isValidRadius(value: unknown): value is string {
  return typeof value === "string" && /^[\d.]+(rem|px|em)$/.test(value.trim())
}

/** Coerce arbitrary input into a safe ThemeTokens, falling back to defaults. */
export function sanitizeTheme(input: Partial<Record<keyof ThemeTokens, unknown>>): ThemeTokens {
  const pick = (k: keyof Omit<ThemeTokens, "radius">) =>
    isValidColor(input[k]) ? (input[k] as string) : THEME_DEFAULTS[k]
  return {
    base: pick("base"),
    onBase: pick("onBase"),
    surface: pick("surface"),
    surfaceAlt: pick("surfaceAlt"),
    muted: pick("muted"),
    ink: pick("ink"),
    radius: isValidRadius(input.radius) ? (input.radius as string) : THEME_DEFAULTS.radius,
  }
}

const oneOf = <T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] => (allowed.includes(value as T[number]) ? (value as T[number]) : fallback)

/** Coerce arbitrary input into safe ThemeOptions (colors validated, enums clamped). */
export function sanitizeThemeOptions(
  input: Partial<Record<keyof ThemeOptions, unknown>>,
): ThemeOptions {
  return {
    success: isValidColor(input.success)
      ? (input.success as string)
      : THEME_OPTION_DEFAULTS.success,
    danger: isValidColor(input.danger) ? (input.danger as string) : THEME_OPTION_DEFAULTS.danger,
    buttonStyle: oneOf(input.buttonStyle, BUTTON_STYLES, THEME_OPTION_DEFAULTS.buttonStyle),
    bannerStyle: oneOf(input.bannerStyle, BANNER_STYLES, THEME_OPTION_DEFAULTS.bannerStyle),
    toastPosition: oneOf(input.toastPosition, TOAST_POSITIONS, THEME_OPTION_DEFAULTS.toastPosition),
    toastRichColors:
      typeof input.toastRichColors === "boolean"
        ? input.toastRichColors
        : THEME_OPTION_DEFAULTS.toastRichColors,
    cardSize: oneOf(input.cardSize, CARD_SIZES, THEME_OPTION_DEFAULTS.cardSize),
  }
}

/** Coerce arbitrary input into a complete, safe ThemeConfig (palette + options). */
export function sanitizeThemeConfig(input: Partial<Record<string, unknown>>): ThemeConfig {
  return { ...sanitizeTheme(input), ...sanitizeThemeOptions(input) }
}

// ─── CSS generation ─────────────────────────────────────────────────────────

/**
 * Build the scoped `<style>` body that maps the 6 brand tokens + radius onto our
 * brand-* variables and the shadcn tokens the storefront consumes. Values are
 * sanitized first, so the output is always a fixed set of safe declarations.
 */
/** Sanitized CSS-variable map: brand-* tokens + the shadcn tokens derived from them. */
export function themeVars(input: Partial<ThemeConfig>): Record<string, string> {
  const t = sanitizeTheme(input)
  const o = sanitizeThemeOptions(input)
  return {
    "--brand-base": t.base,
    "--brand-on-base": t.onBase,
    "--brand-surface": t.surface,
    "--brand-surface-alt": t.surfaceAlt,
    "--brand-muted": t.muted,
    "--brand-ink": t.ink,
    "--brand-success": o.success,
    "--brand-danger": o.danger,
    // shadcn tokens derived from the palette so the whole storefront retones coherently
    "--background": t.surface,
    "--foreground": t.ink,
    "--card": t.surface,
    "--card-foreground": t.ink,
    "--popover": t.surface,
    "--popover-foreground": t.ink,
    "--primary": t.base,
    "--primary-foreground": t.onBase,
    "--secondary": t.surfaceAlt,
    "--secondary-foreground": t.ink,
    "--muted": t.surfaceAlt,
    "--muted-foreground": t.muted,
    "--accent": t.surfaceAlt,
    "--accent-foreground": t.ink,
    "--border": t.surfaceAlt,
    "--input": t.surfaceAlt,
    "--ring": t.base,
    "--success": o.success,
    "--destructive": o.danger,
    "--radius": t.radius,
  }
}

export function buildThemeCss(input: Partial<ThemeConfig>, selector = ".dulce-theme"): string {
  const body = Object.entries(themeVars(input))
    .map(([k, v]) => `${k}:${v}`)
    .join(";")
  return `${selector}{${body}}`
}
