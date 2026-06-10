import { loadAllSettings } from "@/lib/settings"
import { fontFamilyWithFallback, googleFontsHref, isGoogleFont } from "@/lib/google-fonts"

/**
 * Loads the admin-selected fonts from Google Fonts and overrides the storefront
 * font CSS variables, scoped to `selector`. This is what makes runtime font
 * choices actually apply: next/font in the root layout sets the build-time
 * defaults; here we override `--font-display` / `--font-body` for the storefront
 * only when the chosen family is a known Google font.
 *
 * Cached + tag-revalidated via `loadAllSettings`, so pages stay static/ISR and
 * refresh only when typography is saved. Only catalog families reach the URL/CSS
 * (`isGoogleFont`), so there is no arbitrary-CSS path.
 */
export async function FontStyle({ selector = ".dulce-theme" }: { selector?: string }) {
  const { typography } = await loadAllSettings()
  const display = isGoogleFont(typography.displayFont) ? typography.displayFont : null
  const body = isGoogleFont(typography.bodyFont) ? typography.bodyFont : null

  if (!display && !body) return null

  const href = googleFontsHref([display, body].filter((f): f is string => Boolean(f)))
  const vars = [
    display && `--font-display: ${fontFamilyWithFallback(display)};`,
    body && `--font-body: ${fontFamilyWithFallback(body)};`,
  ]
    .filter(Boolean)
    .join(" ")

  // Re-declare font-family on the scope so descendants inherit the overridden
  // vars (the global `body` rule resolves them against the root next/font value;
  // setting it here makes elements inside the storefront pick up the choice).
  const css = `${selector} { ${vars} font-family: var(--font-display), var(--font-body), Arial, sans-serif; }`

  return (
    <>
      {/* `precedence` opts into React 19 stylesheet management: the link is
          hoisted into <head>, loaded before paint and de-duped by href, so font
          changes apply on a normal reload (a plain <link> left in <body> only
          reliably updated after a hard cache-clearing reload). */}
      {href && <link rel="stylesheet" href={href} precedence="high" />}
      {/* Unique key per font choice so React re-inserts the vars when they
          change instead of de-duping against the previous <style>. */}
      <style
        href={`dulce-font-vars-${display ?? "d"}-${body ?? "b"}`}
        precedence="high"
        dangerouslySetInnerHTML={{ __html: css }}
      />
    </>
  )
}
