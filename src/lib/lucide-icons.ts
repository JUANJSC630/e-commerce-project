import { icons, type LucideIcon } from "lucide-react"

/**
 * Lucide icon registry.
 *
 * `icons` is the full record of every Lucide icon keyed by its PascalCase name
 * (e.g. "Package", "ShieldCheck"). We store icon choices as these names, so this
 * is the single source of truth for both the admin picker and the storefront
 * renderer. Importing this pulls the whole icon set into the consuming bundle -
 * intended for the (code-split) admin picker and the server-rendered trust bar.
 */
const REGISTRY = icons as Record<string, LucideIcon>

/** All icon names (PascalCase), sorted alphabetically - feeds the picker list. */
export const ICON_NAMES: string[] = Object.keys(REGISTRY).sort()

/** Resolves an icon name to its component, or `null` if the name is unknown. */
export function getLucideIcon(name: string | null | undefined): LucideIcon | null {
  if (!name) return null
  return REGISTRY[name] ?? null
}
