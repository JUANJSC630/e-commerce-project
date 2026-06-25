"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { getSession } from "next-auth/react"

const STORAGE_KEY = "dulceInfanciaFavorites"

interface FavoritesContextValue {
  ids: string[]
  isFavorite: (productId: string) => boolean
  toggle: (productId: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

function readLocal(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

/**
 * Favorites store. Guests use localStorage; authenticated customers sync to the
 * DB (their localStorage set is merged on login and kept in sync per toggle),
 * so favorites follow them across devices. localStorage stays the instant local
 * mirror either way.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([])
  const [authed, setAuthed] = useState(false)

  const sync = useCallback(async () => {
    const local = readLocal()
    setIds(local) // instant from local mirror

    const session = await getSession()
    const isAuthed = !!session?.user
    setAuthed(isAuthed)
    if (!isAuthed) return

    // Merge local favorites into the account and adopt the unified set.
    try {
      const res = await fetch("/api/cuenta/favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: local }),
      })
      if (res.ok) {
        const merged = (await res.json()) as string[]
        setIds(merged)
        writeLocal(merged)
      }
    } catch {
      /* offline - keep the local set */
    }
  }, [])

  useEffect(() => {
    sync()
    // Re-sync when auth changes (login/register/logout dispatch this).
    window.addEventListener("auth-changed", sync)
    return () => window.removeEventListener("auth-changed", sync)
  }, [sync])

  const isFavorite = useCallback((productId: string) => ids.includes(productId), [ids])

  const toggle = useCallback(
    (productId: string) => {
      const has = ids.includes(productId)
      const next = has ? ids.filter((id) => id !== productId) : [...ids, productId]
      setIds(next)
      writeLocal(next)

      if (authed) {
        fetch("/api/cuenta/favorites", {
          method: has ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }).catch(() => {
          /* best-effort; local mirror already updated */
        })
      }
    },
    [ids, authed],
  )

  return (
    <FavoritesContext.Provider value={{ ids, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavoritesContext(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider")
  return ctx
}
