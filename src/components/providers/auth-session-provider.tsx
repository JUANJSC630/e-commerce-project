"use client"

import { SessionProvider } from "next-auth/react"

/** Enables `useSession` for the client subtree it wraps (e.g. storefront reviews). */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
