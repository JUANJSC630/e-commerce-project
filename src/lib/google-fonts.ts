/**
 * Curated Google Fonts catalog.
 *
 * Powers the admin font picker AND the storefront font loader. Choices are
 * validated against this list (`isGoogleFont`) so only known family names ever
 * reach a Google Fonts URL or an injected CSS variable - no arbitrary input.
 */

export type FontCategory = "sans" | "serif" | "display" | "mono" | "handwriting"

export interface GoogleFont {
  name: string
  category: FontCategory
}

/** Popular, broadly useful families grouped by category. */
export const GOOGLE_FONTS: GoogleFont[] = [
  // Sans-serif
  { name: "Inter", category: "sans" },
  { name: "Roboto", category: "sans" },
  { name: "Open Sans", category: "sans" },
  { name: "Lato", category: "sans" },
  { name: "Montserrat", category: "sans" },
  { name: "Poppins", category: "sans" },
  { name: "Nunito", category: "sans" },
  { name: "Nunito Sans", category: "sans" },
  { name: "Work Sans", category: "sans" },
  { name: "Source Sans 3", category: "sans" },
  { name: "Raleway", category: "sans" },
  { name: "Rubik", category: "sans" },
  { name: "Mulish", category: "sans" },
  { name: "Karla", category: "sans" },
  { name: "DM Sans", category: "sans" },
  { name: "Manrope", category: "sans" },
  { name: "Quicksand", category: "sans" },
  { name: "Cabin", category: "sans" },
  { name: "Figtree", category: "sans" },
  { name: "Plus Jakarta Sans", category: "sans" },
  { name: "Outfit", category: "sans" },
  { name: "Lexend", category: "sans" },
  { name: "Noto Sans", category: "sans" },
  { name: "PT Sans", category: "sans" },
  { name: "Atkinson Hyperlegible", category: "sans" },
  { name: "Hanken Grotesk", category: "sans" },
  { name: "Onest", category: "sans" },
  { name: "Albert Sans", category: "sans" },
  // Serif
  { name: "Playfair Display", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "PT Serif", category: "serif" },
  { name: "Source Serif 4", category: "serif" },
  { name: "Noto Serif", category: "serif" },
  { name: "EB Garamond", category: "serif" },
  { name: "Cormorant Garamond", category: "serif" },
  { name: "Libre Baskerville", category: "serif" },
  { name: "Bitter", category: "serif" },
  { name: "Crimson Text", category: "serif" },
  { name: "Spectral", category: "serif" },
  { name: "DM Serif Display", category: "serif" },
  { name: "Fraunces", category: "serif" },
  // Display
  { name: "Baloo 2", category: "display" },
  { name: "Comfortaa", category: "display" },
  { name: "Bebas Neue", category: "display" },
  { name: "Righteous", category: "display" },
  { name: "Pacifico", category: "display" },
  { name: "Lobster", category: "display" },
  { name: "Archivo Black", category: "display" },
  { name: "Anton", category: "display" },
  { name: "Fredoka", category: "display" },
  { name: "Titan One", category: "display" },
  { name: "Chewy", category: "display" },
  { name: "Bungee", category: "display" },
  // Handwriting
  { name: "Caveat", category: "handwriting" },
  { name: "Dancing Script", category: "handwriting" },
  { name: "Shadows Into Light", category: "handwriting" },
  { name: "Satisfy", category: "handwriting" },
  { name: "Kalam", category: "handwriting" },
  // Monospace
  { name: "JetBrains Mono", category: "mono" },
  { name: "Fira Code", category: "mono" },
  { name: "Source Code Pro", category: "mono" },
  { name: "IBM Plex Mono", category: "mono" },
  { name: "Space Mono", category: "mono" },
]

const FONT_NAMES = new Set(GOOGLE_FONTS.map((f) => f.name))

/** Generic CSS fallback for each category, appended after the family. */
const FALLBACK: Record<FontCategory, string> = {
  sans: "sans-serif",
  serif: "serif",
  display: "cursive",
  handwriting: "cursive",
  mono: "monospace",
}

/** True when `name` is a known family from the catalog. */
export function isGoogleFont(name: string | null | undefined): name is string {
  return Boolean(name && FONT_NAMES.has(name))
}

/** `"Family Name", <generic-fallback>` for use in a CSS font-family value. */
export function fontFamilyWithFallback(name: string): string {
  const font = GOOGLE_FONTS.find((f) => f.name === name)
  return `"${name}", ${FALLBACK[font?.category ?? "sans"]}`
}

/**
 * Builds a Google Fonts css2 stylesheet URL for the given families. Each family
 * loads a useful weight range. Unknown families are dropped. Returns null when
 * nothing valid remains.
 */
export function googleFontsHref(names: string[], weights = "400;500;600;700;800"): string | null {
  const families = names
    .filter(isGoogleFont)
    .map((n) => `family=${encodeURIComponent(n).replace(/%20/g, "+")}:wght@${weights}`)
  if (families.length === 0) return null
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`
}
