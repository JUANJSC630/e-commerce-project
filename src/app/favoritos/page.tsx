import type { Metadata } from "next"
import { pageSeo } from "@/config/store.config"
import { FavoritesList } from "@/components/favorites/favorites-list"

export const metadata: Metadata = {
  title: pageSeo.favorites.title,
  description: pageSeo.favorites.description,
}

export default function FavoritesPage() {
  return <FavoritesList />
}
