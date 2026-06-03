/**
 * @deprecated Use src/config/theme.config.ts instead.
 * This file is kept only for backward compatibility during migration.
 */
export { brandColors, typography, radius } from "@/config/theme.config"

export const themeConfig = {
  borderRadius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius)",
  },
  fontFamily: {
    heading: "var(--font-display)",
    body: "var(--font-body)",
  },
}
