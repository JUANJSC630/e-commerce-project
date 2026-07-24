import type React from "react"
import { redirect } from "next/navigation"
import { getSessionUserId } from "@/lib/session"
import { getProfile } from "@/lib/account"
import { AccountNav } from "@/components/account/account-nav"

/**
 * Shared chrome for the authenticated account dashboard: a persistent sidebar
 * (greeting + section nav) beside the active section. The auth guard lives here
 * so every child section inherits it - `/cuenta/login` and `/cuenta/registro`
 * sit outside this route group and are unaffected. The whole dashboard is
 * width-capped (`max-w-6xl`) so form fields and cards keep comfortable
 * proportions on wide screens instead of stretching edge to edge. On mobile the
 * sidebar stacks above the content.
 */
export default async function AccountDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userId = await getSessionUserId()
  if (!userId) redirect("/cuenta/login")

  const { name, email } = await getProfile(userId)
  const greeting = name?.trim() || "de nuevo"

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[15rem_1fr] lg:gap-8">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Hola,</p>
              <p className="font-display text-lg font-bold leading-tight text-brand-base">
                {greeting}
              </p>
              <p className="mt-1 truncate text-xs text-brand-muted" title={email}>
                {email}
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <AccountNav />
            </div>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
