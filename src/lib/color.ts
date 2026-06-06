/**
 * Framework-agnostic color math for the theme editor.
 *
 * Converts between OKLCH (our canonical storage format) and sRGB hex (what the
 * native <input type="color"> speaks), and computes WCAG contrast. Pure
 * functions, no dependencies — usable on client or server.
 *
 * Reference: https://bottosson.github.io/posts/oklab/
 */

export interface Oklch {
  /** Lightness 0–1 */
  l: number
  /** Chroma ≥ 0 */
  c: number
  /** Hue 0–360 (degrees) */
  h: number
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

// ─── OKLCH → hex ────────────────────────────────────────────────────────────

/** Linear-light sRGB channel → gamma-encoded 0–1. */
function linearToSrgb(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055
}

/** Gamma-encoded sRGB channel 0–1 → linear-light. */
function srgbToLinear(x: number): number {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
}

const toHex2 = (v: number) =>
  Math.round(clamp01(v) * 255)
    .toString(16)
    .padStart(2, "0")

export function oklchToHex({ l, c, h }: Oklch): string {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b

  const L = l_ * l_ * l_
  const M = m_ * m_ * m_
  const S = s_ * s_ * s_

  const r = linearToSrgb(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S)
  const g = linearToSrgb(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S)
  const bl = linearToSrgb(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S)

  return `#${toHex2(r)}${toHex2(g)}${toHex2(bl)}`
}

// ─── hex → OKLCH ──────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function hexToOklch(hex: string): Oklch | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const [r, g, b] = rgb.map((v) => srgbToLinear(v / 255)) as [number, number, number]

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  const c = Math.sqrt(A * A + B * B)
  let h = (Math.atan2(B, A) * 180) / Math.PI
  if (h < 0) h += 360
  return { l: L, c, h }
}

// ─── Parsing / formatting OKLCH strings ─────────────────────────────────────

/** Parse `oklch(0.68 0.08 145)` (lightness may be a percentage). */
export function parseOklch(value: string): Oklch | null {
  const m = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i.exec(value.trim())
  if (!m) return null
  const l = m[1].endsWith("%") ? parseFloat(m[1]) / 100 : parseFloat(m[1])
  return { l, c: parseFloat(m[2]), h: parseFloat(m[3]) }
}

const round = (n: number, d: number) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}

/** Format an Oklch back into a canonical `oklch(L C H)` string. */
export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)})`
}

/** Best-effort: any supported color string → hex for a native picker. */
export function colorToHex(value: string): string {
  const v = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase()
  const oklch = parseOklch(v)
  if (oklch) return oklchToHex(oklch)
  return "#000000"
}

// ─── WCAG contrast ──────────────────────────────────────────────────────────

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map((v) => srgbToLinear(v / 255)) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.1 contrast ratio (1–21) between two colors given in any supported format. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(colorToHex(a))
  const lb = relativeLuminance(colorToHex(b))
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return round((hi + 0.05) / (lo + 0.05), 2)
}
