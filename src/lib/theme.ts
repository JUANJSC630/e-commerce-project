/**
 * Theme tokens, presets, validation and CSS generation for the storefront.
 *
 * Security: the editor only ever stores validated color/length values. Before a
 * value reaches the injected `<style>`, `isValidColor`/`isValidRadius` reject
 * anything that isn't a plain color or length literal — there is no path for
 * arbitrary CSS (no `;`, `{`, `}`, `url(...)`, etc.), so the theme cannot be
 * used for CSS/style injection.
 */

import { brandColors } from "@/config/theme.config"
import { radius as radiusConfig } from "@/config/theme.config"

export interface ThemeTokens {
  /** Primary accent — buttons, links, active states */
  base: string
  /** Foreground on top of `base` */
  onBase: string
  /** Page / card background */
  surface: string
  /** Deeper surface — sections, inputs, borders */
  surfaceAlt: string
  /** Muted tone — secondary text, subtle icons */
  muted: string
  /** Ink — headings, body text, dark surfaces */
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
]

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * True only for plain color literals: #rrggbb, oklch(), rgb()/rgba(), hsl()/hsla().
 * Deliberately strict — the character set forbids anything that could break out
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

// ─── CSS generation ─────────────────────────────────────────────────────────

/**
 * Build the scoped `<style>` body that maps the 6 brand tokens + radius onto our
 * brand-* variables and the shadcn tokens the storefront consumes. Values are
 * sanitized first, so the output is always a fixed set of safe declarations.
 */
/** Sanitized CSS-variable map: brand-* tokens + the shadcn tokens derived from them. */
export function themeVars(
  input: Partial<Record<keyof ThemeTokens, unknown>>,
): Record<string, string> {
  const t = sanitizeTheme(input)
  return {
    "--brand-base": t.base,
    "--brand-on-base": t.onBase,
    "--brand-surface": t.surface,
    "--brand-surface-alt": t.surfaceAlt,
    "--brand-muted": t.muted,
    "--brand-ink": t.ink,
    // shadcn tokens derived from the 6 so the whole storefront retones coherently
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
    "--radius": t.radius,
  }
}

export function buildThemeCss(
  input: Partial<Record<keyof ThemeTokens, unknown>>,
  selector = ".dulce-theme",
): string {
  const body = Object.entries(themeVars(input))
    .map(([k, v]) => `${k}:${v}`)
    .join(";")
  return `${selector}{${body}}`
}
