"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

const STORAGE_KEY = "newsletter_dismissed"
const SHOW_DELAY_MS = 5000

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, "1")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    // Store subscription (could hit an API later)
    setStatus("success")
    setTimeout(dismiss, 2500)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-600 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Gradient header */}
        <div className="bg-gradient-to-br from-brand-base to-brand-base/80 px-6 py-8 text-center text-brand-on-base">
          <p className="text-sm font-medium opacity-80 uppercase tracking-wide">
            Bienvenido/a a la familia
          </p>
          <p className="text-4xl font-bold mt-1">10% OFF</p>
          <p className="text-sm mt-1 opacity-80">en tu primera compra</p>
        </div>

        {/* Form body */}
        <div className="px-6 py-6">
          {status === "success" ? (
            <div className="text-center py-4">
              <p className="text-lg font-semibold text-brand-ink">¡Listo! 🎉</p>
              <p className="text-sm text-brand-muted mt-1">
                Revisa tu correo para obtener tu código de descuento.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-brand-muted text-center mb-4">
                Suscríbete a nuestro newsletter y recibe un cupón exclusivo para nuevos clientes.
              </p>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-brand-base"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-5 py-2.5 rounded-lg bg-brand-base text-brand-on-base text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
                >
                  {status === "loading" ? "…" : "Suscribirme"}
                </button>
              </form>
              <p className="text-xs text-brand-muted/60 text-center mt-3">
                Sin spam. Puedes cancelar cuando quieras.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
