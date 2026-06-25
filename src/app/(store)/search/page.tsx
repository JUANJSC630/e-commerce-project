import type { Metadata } from "next"
import { searchProducts } from "@/lib/products"
import { loadAllSettings } from "@/lib/settings"
import { pageSeo } from "@/config/store.config"
import { SearchResults } from "@/components/search/search-results"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const [{ q }, { brand }] = await Promise.all([searchParams, loadAllSettings()])
  const { title, description } = pageSeo.search(brand)
  if (q?.trim()) {
    return { title: `"${q}" - Búsqueda en ${brand.name}`, description }
  }
  return { title, description }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""
  const results = await searchProducts(query)

  return <SearchResults query={query} results={results} />
}
