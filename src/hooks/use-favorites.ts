"use client"

import { useState, useCallback } from "react"

const FAVORITES_KEY = "dulceInfanciaFavorites"

function readIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function useFavorites(productId: string) {
  const [isFavorite, setIsFavorite] = useState(() => readIds().includes(productId))

  const toggleFavorite = useCallback(() => {
    setIsFavorite((prev) => {
      const next = !prev
      try {
        const ids = readIds()
        const updated = next ? [...ids, productId] : ids.filter((id) => id !== productId)
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
      } catch {}
      return next
    })
  }, [productId])

  return { isFavorite, toggleFavorite }
}
