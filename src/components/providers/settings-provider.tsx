"use client"

import { createContext, useContext, useMemo } from "react"
import type { StoreSettings } from "@/lib/settings"
import { formatPrice as formatPriceWith } from "@/lib/utils"

/**
 * Makes the DB-backed store settings available to Client Components.
 * Server Components should call `loadAllSettings()` directly instead.
 *
 * The provider is mounted once in `(store)/layout.tsx`, which reads the
 * settings on the server and passes them down already serialized.
 */
const SettingsContext = createContext<StoreSettings | null>(null)

export function SettingsProvider({
  settings,
  children,
}: {
  settings: StoreSettings
  children: React.ReactNode
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}

/** Read the full store settings from a Client Component. */
export function useSettings(): StoreSettings {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return ctx
}

/** Convenience: a price formatter bound to the active locale settings. */
export function useFormatPrice(): (amount: number) => string {
  const { locale } = useSettings()
  return useMemo(() => (amount: number) => formatPriceWith(amount, locale), [locale])
}
