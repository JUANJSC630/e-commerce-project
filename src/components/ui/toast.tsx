"use client"

/**
 * Este componente es un reemplazo del toast basado en Radix UI.
 * Ahora utilizamos Sonner para los toasts, pero mantenemos esta interfaz
 * para compatibilidad con código existente.
 * 
 * Para nuevas implementaciones, usa directamente Sonner a través de:
 * import { toast } from "sonner";
 * o
 * import { useSonner } from "@/hooks/use-sonner";
 * 
 * @deprecated Use Sonner directamente en lugar de este componente
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react"
import { toast as sonnerToast } from "sonner"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Interfaces de compatibilidad que son similares a las de Radix
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

const ToastViewport: React.FC<{ className?: string }> = () => {
  return null // Sonner maneja su propio viewport
}

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastProps extends VariantProps<typeof toastVariants> {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  action,
  variant = "default",
  className,
  open,
  onOpenChange,
  ...props
}) => {
  // Aquí usaríamos un efecto si necesitáramos mostrar o esconder el toast basado en 'open'
  return null; // Sonner maneja sus propios toasts
}

// Componentes para compatibilidad con el API anterior
const ToastAction: React.FC<{ className?: string; altText: string }> = () => null;
const ToastClose: React.FC<{ className?: string }> = () => null;
const ToastTitle: React.FC<{ className?: string }> = () => null;
const ToastDescription: React.FC<{ className?: string }> = () => null;

// Estos tipos se mantienen para compatibilidad
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
