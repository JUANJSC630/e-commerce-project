import { unstable_cache, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { SETTINGS_KEYS } from "@/lib/settings-keys"
import {
  brand as defaultBrand,
  locale as defaultLocale,
  shipping as defaultShipping,
  paymentMethods as defaultPaymentMethods,
  promoBanner as defaultPromoBanner,
  social as defaultSocial,
  contact as defaultContact,
} from "@/config/store.config"
import { brandColors as defaultTheme, typography as defaultTypography } from "@/config/theme.config"
import { homeContent as defaultHomeContent, type HomeContent } from "@/config/store.config"

/** Cache tag for all settings reads. Revalidated whenever a setting is saved. */
export const SETTINGS_TAG = "settings"

export interface StoreSettings {
  brand: typeof defaultBrand
  locale: typeof defaultLocale
  shipping: typeof defaultShipping
  paymentMethods: typeof defaultPaymentMethods
  promoBanner: typeof defaultPromoBanner
  social: typeof defaultSocial
  contact: typeof defaultContact
  theme: typeof defaultTheme
  typography: typeof defaultTypography
  homeContent: HomeContent
}

/**
 * Loads all settings from the database and merges with file defaults.
 * DB values override file defaults per-key. Cached + tag-revalidated so the
 * storefront (ISR) reads it cheaply and refreshes only when a setting is saved.
 */
export const loadAllSettings = unstable_cache(
  async (): Promise<StoreSettings> => {
    const rows = await prisma.setting.findMany()
    const dbMap = new Map(rows.map((r) => [r.key, r.value]))

    return {
      brand: merge(defaultBrand, dbMap.get(SETTINGS_KEYS.brand)),
      locale: merge(defaultLocale, dbMap.get(SETTINGS_KEYS.locale)),
      shipping: merge(defaultShipping, dbMap.get(SETTINGS_KEYS.shipping)),
      paymentMethods:
        (dbMap.get(SETTINGS_KEYS.paymentMethods) as unknown as typeof defaultPaymentMethods) ??
        defaultPaymentMethods,
      promoBanner: merge(defaultPromoBanner, dbMap.get(SETTINGS_KEYS.promoBanner)),
      social: merge(defaultSocial, dbMap.get(SETTINGS_KEYS.social)),
      contact: merge(defaultContact, dbMap.get(SETTINGS_KEYS.contact)),
      theme: merge(defaultTheme, dbMap.get(SETTINGS_KEYS.theme)),
      typography: merge(defaultTypography, dbMap.get(SETTINGS_KEYS.typography)),
      homeContent: merge(defaultHomeContent, dbMap.get(SETTINGS_KEYS.homeContent)),
    }
  },
  ["all-settings"],
  { tags: [SETTINGS_TAG] },
)

/**
 * Loads a single setting section by key.
 */
export async function loadSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.setting.findUnique({ where: { key } })
  if (!row) return fallback
  return merge(fallback, row.value)
}

/**
 * Saves a setting section. Creates or updates.
 */
export async function saveSetting(key: string, value: unknown) {
  const saved = await prisma.setting.upsert({
    where: { key },
    create: { key, value: value as object },
    update: { value: value as object },
  })
  // Invalidate the cached storefront settings so ISR picks up the change.
  revalidateTag(SETTINGS_TAG)
  return saved
}

function merge<T>(defaults: T, overrides: unknown): T {
  if (!overrides || typeof overrides !== "object") return defaults
  return { ...defaults, ...(overrides as Partial<T>) }
}
