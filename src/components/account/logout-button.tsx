"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { ConfirmModal } from "@/components/ui/confirm-modal"

/**
 * "Cerrar sesión" trigger that asks for confirmation before signing out, so a
 * stray click never drops the session. `className` styles the trigger to match
 * its host (e.g. an account-nav row).
 */
export function LogoutButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

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

      <ConfirmModal
        open={open}
        title="¿Cerrar sesión?"
        description="Tendrás que volver a iniciar sesión para ver tus pedidos y tus datos."
        confirmLabel={signingOut ? "Cerrando…" : "Cerrar sesión"}
        destructive
        busy={signingOut}
        onConfirm={() => {
          setSigningOut(true)
          signOut({ callbackUrl: "/" })
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
