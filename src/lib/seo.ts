import "server-only"
import type { Metadata } from "next"
import { loadAllSettings } from "@/lib/settings"
import { pageSeo, seo } from "@/config/store.config"

type PageSeoKey = keyof typeof pageSeo

/** `"<title> - <Brand>"` using the live brand from settings. */
export async function titleWithBrand(pageTitle: string): Promise<string> {
  const { brand } = await loadAllSettings()
  return `${pageTitle} - ${brand.name}`
}

/** Metadata for a private page (account/checkout): brand-aware title, noindex. */
export async function privatePageMetadata(pageTitle: string): Promise<Metadata> {
  return {
    title: await titleWithBrand(pageTitle),
    robots: { index: false, follow: false },
  }
}

/** Indexable metadata from a `pageSeo` entry, resolved with the live brand. */
export async function pageMetadata(key: PageSeoKey): Promise<Metadata> {
  const { brand } = await loadAllSettings()
  const { title, description } = pageSeo[key](brand)
  return { title, description, openGraph: { title, description, type: "website" } }
}

/** Indexable metadata from an explicit title/description, resolved with brand. */
export async function customMetadata(pageTitle: string, description: string): Promise<Metadata> {
  const title = await titleWithBrand(pageTitle)
  return { title, description, openGraph: { title, description, type: "website" } }
}

/** Global site defaults for the root layout. */
export async function rootMetadata(): Promise<Metadata> {
  const { brand } = await loadAllSettings()
  const { title, description, generator } = seo(brand)
  return { title, description, generator }
}
