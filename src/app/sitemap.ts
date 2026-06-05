import type { MetadataRoute } from "next"
import { getAllProductIds } from "@/lib/products"
import { routes } from "@/config/store.config"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dulceinfancia.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productIds = await getAllProductIds()
  const productEntries: MetadataRoute.Sitemap = productIds.map((id) => ({
    url: `${BASE_URL}${routes.products}/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
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
      url: `${BASE_URL}${routes.essentials}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/category/babies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/category/girls`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/category/boys`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/category/sales`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...productEntries,
  ]
}
