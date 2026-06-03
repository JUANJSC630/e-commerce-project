"use client"

import { toast as sonnerToast, type ToastT } from "sonner"

export type SonnerToastProps = ToastT

export function useSonner() {
  return {
    toast: sonnerToast,
    success: sonnerToast.success,
    error: sonnerToast.error,
    warning: sonnerToast.warning,
    info: sonnerToast.info,
    loading: sonnerToast.loading,
    promise: sonnerToast.promise,
    custom: sonnerToast.custom,
    dismiss: sonnerToast.dismiss,
  }
}

export { sonnerToast as toast }
