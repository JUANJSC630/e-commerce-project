"use client"

/**
 * Este archivo es un proxy al hook use-sonner para mantener compatibilidad con código existente 
 * que usa el antiguo sistema de toast.
 */

import { toast, useSonner } from "./use-sonner"

// Exportamos un hook con la misma interfaz que el antiguo useToast
export function useToast() {
  return useSonner()
}

// Exportamos la función toast para mantener compatibilidad
export { toast }
