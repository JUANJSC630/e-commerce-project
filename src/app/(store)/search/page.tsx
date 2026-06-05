import type { Metadata } from "next"
import { searchProducts } from "@/lib/products"
import { pageSeo } from "@/config/store.config"
import { SearchResults } from "@/components/search/search-results"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  if (q?.trim()) {
    return {
      title: `"${q}" — Búsqueda en Dulce Infancia`,
      description: pageSeo.search.description,
    }
  }
  return {
    title: pageSeo.search.title,
    description: pageSeo.search.description,
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""
  const results = await searchProducts(query)

  return <SearchResults query={query} results={results} />
}
