"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { promoBanner } from "@/config/store.config"

const DISMISSED_KEY = "dulceInfanciaPromoBannerDismissed"

export function PromoBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!promoBanner.enabled) return
    try {
      if (!localStorage.getItem(DISMISSED_KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(DISMISSED_KEY, "1")
    } catch {}
  }

  if (!visible) return null

  return (
    <div
      role="banner"
      aria-label="Promoción"
      className="bg-brand-base text-brand-on-base text-sm py-2 px-4"
    >
      <div className="container mx-auto flex items-center justify-center gap-3 relative">
        <span className="text-center font-medium">{promoBanner.message}</span>
        {promoBanner.ctaText && promoBanner.ctaHref && (
          <Link
            href={promoBanner.ctaHref}
            className="underline underline-offset-2 font-semibold hover:no-underline transition-all shrink-0"
          >
            {promoBanner.ctaText}
          </Link>
        )}
        <button
          onClick={dismiss}
          aria-label="Cerrar promoción"
          className="absolute right-0 p-1 rounded hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
