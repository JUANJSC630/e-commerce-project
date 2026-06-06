"use client"

import { useFavoritesContext } from "@/components/favorites/favorites-provider"

/** Favorite state + toggle for a single product. */
export function useFavorites(productId: string) {
  const { isFavorite, toggle } = useFavoritesContext()
  return {
    isFavorite: isFavorite(productId),
    toggleFavorite: () => toggle(productId),
  }
}

/** All favorited product ids (guests: localStorage; customers: synced with DB). */
export function useAllFavoriteIds(): string[] {
  return useFavoritesContext().ids
}
