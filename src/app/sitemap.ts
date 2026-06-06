import type { MetadataRoute } from "next"
import { getAllProductIds } from "@/lib/products"
import { getActiveCategorySlugs } from "@/lib/categories"
import { routes } from "@/config/store.config"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dulceinfancia.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productIds, categorySlugs] = await Promise.all([
    getAllProductIds(),
    getActiveCategorySlugs(),
  ])

  const productEntries: MetadataRoute.Sitemap = productIds.map((id) => ({
    url: `${BASE_URL}${routes.products}/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE_URL}${routes.categoryBase}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    {
      url: `${BASE_URL}${routes.products}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}${routes.categoryBase}/sales`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...categoryEntries,
    ...productEntries,
  ]
}
