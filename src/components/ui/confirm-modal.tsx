"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Style the confirm button as destructive (red). */
  destructive?: boolean
  /** Disables the buttons while an async action runs. */
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Small confirmation dialog, rendered through a portal to `document.body` so it
 * escapes any `sticky`/`transform` ancestor that would establish a stacking
 * context and paint sibling content over it. The `dulce-theme` class re-declares
 * the brand CSS vars, which are scoped to the storefront wrapper the portal
 * jumps out of. Open state is owned by the caller.
 */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel()
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, busy, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="dulce-theme fixed inset-0 z-[70] grid place-items-center bg-brand-ink/50 p-4"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
      >
        <h2 className="font-display text-lg font-bold text-brand-ink">{title}</h2>
        {description && <p className="mt-2 text-sm text-brand-muted">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(destructive && "bg-destructive text-white hover:bg-destructive/90")}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
