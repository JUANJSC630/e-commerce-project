"use client"

/**
 * Este componente es un reemplazo del toaster basado en Radix UI.
 * Ahora usamos directamente el componente Toaster de sonner.
 * 
 * Para agregar toasts, utiliza el hook useSonner() o importa toast directamente de sonner.
 */

import { Toaster as SonnerToaster } from "@/components/ui/sonner"

export function Toaster() {
  return <SonnerToaster />
}
