import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import { FavoritesList } from "@/components/favorites/favorites-list"

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("favorites")
}

export default function FavoritesPage() {
  return <FavoritesList />
}
