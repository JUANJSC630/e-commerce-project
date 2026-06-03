/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                THEME CONFIGURATION                          ║
 * ║  Define brand colors and fonts here. Values are injected    ║
 * ║  into globals.css as CSS custom properties at build time.   ║
 * ║                                                             ║
 * ║  Color format: oklch(lightness chroma hue)                  ║
 * ║  Tool: https://oklch.com — pick your color visually        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Brand color palette.
 *
 * These values are applied as CSS variables in globals.css:
 *   --brand-base       → primary brand / accent color (buttons, highlights)
 *   --brand-surface    → warm background / card surface
 *   --brand-muted      → muted text, borders, secondary backgrounds
 *   --brand-on-base    → text color on top of --brand-base
 *   --brand-ink        → main text / dark surfaces
 *
 * To change the palette, replace the oklch() values below.
 * Tip: keep chroma low (<0.05) for neutrals, medium (0.08-0.15) for accents.
 */
export const brandColors = {
  /** Primary accent — buttons, active states, price highlights */
  base: "oklch(0.68 0.08 145)", // verde salvia

  /** Foreground on top of base (e.g. button label) */
  onBase: "oklch(0.98 0 0)", // white

  /** Beige claro — page background, card fills */
  surface: "oklch(0.95 0.022 80)", // beige claro

  /** Slightly deeper beige — section backgrounds, input backgrounds */
  surfaceAlt: "oklch(0.91 0.028 78)", // beige medio

  /** Muted tones — borders, secondary text, subtle icons */
  muted: "oklch(0.58 0.012 120)", // gris oliva suave

  /** Dark ink — headings, body text, footer background */
  ink: "oklch(0.20 0.012 145)", // verde muy oscuro / casi negro
}

/**
 * Typography configuration.
 *
 * Fonts are loaded via next/font/google in layout.tsx.
 * Change the font names here AND update the import in layout.tsx to match.
 *
 * Recommended pairs (not on the reflex-rejection list):
 *   Display: "Baloo 2", "Nunito", "Quicksand", "Cabin"
 *   Body:    "Atkinson Hyperlegible", "Source Sans 3", "Lato", "Noto Sans"
 */
export const typography = {
  /** Font used for headings, logo, display text */
  displayFont: "Nunito",

  /** Font used for body text, labels, inputs */
  bodyFont: "Atkinson Hyperlegible",
}

/**
 * Border radius scale.
 * Controls how rounded elements appear throughout the UI.
 * Lower values = sharper/more modern. Higher = softer/friendlier.
 */
export const radius = {
  base: "0.625rem", // --radius in globals.css
}
