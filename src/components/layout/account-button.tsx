"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { routes } from "@/config/store.config"
import { useAccountDialog } from "@/components/account/account-dialog"

const className =
  "hidden md:inline-flex items-center gap-2 h-10 px-3 rounded-full text-brand-ink hover:text-brand-base hover:bg-brand-surface-alt transition-colors"

/**
 * Desktop header account control. With a session it links to `/cuenta` and shows
 * the customer's name (truncated) so the logged-in state is visible; without one
 * it shows "Cuenta" and opens the login modal instead of navigating away.
 */
export function AccountButton({
  isAuthenticated,
  userName,
}: {
  isAuthenticated: boolean
  userName?: string | null
}) {
  const { openLogin } = useAccountDialog()

  if (isAuthenticated) {
    const label = userName?.trim() || "Mi cuenta"
    return (
      <Link href={routes.account} className={className} title={label}>
        <User className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="max-w-[8rem] truncate text-sm font-medium">{label}</span>
      </Link>
    )
  }

  return (
    <button type="button" onClick={openLogin} className={className}>
      <User className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium">Cuenta</span>
    </button>
  )
}
