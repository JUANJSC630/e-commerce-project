"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * "Cerrar sesión" trigger that opens a confirmation modal before signing out,
 * so a stray click never drops the session. Self-contained (own open state +
 * overlay/escape/scroll-lock). The overlay is rendered through a portal to
 * `document.body`: the trigger lives inside the account sidebar `<aside>`, which
 * is `position: sticky` and therefore establishes a stacking context - without
 * the portal the `fixed` overlay would be trapped in it and the sibling content
 * column (the profile form) would paint on top, covering the modal and making
 * its buttons unclickable. `className` styles the trigger to match its host.
 */
export function LogoutButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  function confirm() {
    setSigningOut(true)
    signOut({ callbackUrl: "/" })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "flex items-center gap-2 text-sm text-brand-muted transition-colors hover:text-destructive"
        }
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        Cerrar sesión
      </button>

      {open &&
        createPortal(
          <div
            // `dulce-theme` re-declares the brand CSS vars: portaled to
            // document.body, this node sits outside the store's `.dulce-theme`
            // wrapper, so `bg-card`/`text-brand-ink`/`bg-destructive` would
            // otherwise have nothing to resolve against.
            className="dulce-theme fixed inset-0 z-[70] grid place-items-center bg-brand-ink/50 p-4"
            onClick={() => !signingOut && setOpen(false)}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              aria-describedby="logout-desc"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
            >
              <h2 id="logout-title" className="font-display text-lg font-bold text-brand-ink">
                ¿Cerrar sesión?
              </h2>
              <p id="logout-desc" className="mt-2 text-sm text-brand-muted">
                Tendrás que volver a iniciar sesión para ver tus pedidos y tus datos.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={signingOut}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={confirm}
                  disabled={signingOut}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {signingOut ? "Cerrando…" : "Cerrar sesión"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
