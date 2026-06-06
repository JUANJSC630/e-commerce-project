import { loadAllSettings } from "@/lib/settings"
import { buildThemeCss } from "@/lib/theme"

/**
 * Injects the active theme as a scoped `<style>` so the storefront reflects the
 * colors configured in /admin. Cached + tag-revalidated via `loadAllSettings`,
 * so the page stays static/ISR and only refreshes when the theme is saved.
 *
 * The CSS body is built by `buildThemeCss`, which sanitizes every value — there
 * is no path for arbitrary CSS through `dangerouslySetInnerHTML`.
 */
export async function ThemeStyle({ selector = ".dulce-theme" }: { selector?: string }) {
  const { theme } = await loadAllSettings()
  return (
    <style
      id="dulce-theme-vars"
      dangerouslySetInnerHTML={{ __html: buildThemeCss(theme, selector) }}
    />
  )
}
