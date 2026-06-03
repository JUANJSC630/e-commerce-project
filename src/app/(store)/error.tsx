"use client"

import { useEffect } from "react"
import { brand, routes } from "@/config/store.config"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-display font-bold text-brand-base">¡Ups!</p>
      <h1 className="mt-4 text-2xl font-display font-semibold text-foreground">Algo salió mal</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        Ocurrió un error inesperado en {brand.name}. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-brand-base text-brand-on-base rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Intentar de nuevo
        </button>
        <a
          href={routes.home}
          className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-brand-surface-alt transition-colors"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  )
}
