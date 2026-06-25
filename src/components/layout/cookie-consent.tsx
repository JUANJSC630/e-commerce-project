"use client"

import { useEffect, useState } from "react"
import { Cookie } from "lucide-react"

const STORAGE_KEY = "dulceInfanciaCookieConsent"

/**
 * Cookie consent banner (Colombian data-protection compliance). Shows once until
 * the visitor accepts; the choice is remembered in localStorage. Rendered after
 * mount only, so the server markup and first client paint match (no hydration
 * mismatch from reading localStorage).
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // localStorage unavailable (private mode) — skip the banner.
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    } catch {
      // Ignore write failures; the banner just won't persist its dismissal.
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm shadow-lg"
    >
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <Cookie className="h-6 w-6 text-brand-base shrink-0" aria-hidden="true" />
        <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
          Usamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el
          contenido. Al continuar navegando aceptas su uso conforme a la Ley 1581 de 2012 de
          protección de datos.
        </p>
        <button
          type="button"
          onClick={accept}
          className="btn-cta shrink-0 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}
