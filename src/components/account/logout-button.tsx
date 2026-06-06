"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 text-sm text-brand-muted hover:text-destructive transition-colors"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Cerrar sesión
    </button>
  )
}
