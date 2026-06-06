/**
 * Settings keys used in the database.
 * Each key stores a JSON object corresponding to a section of the store config.
 */
export const SETTINGS_KEYS = {
  brand: "brand",
  locale: "locale",
  shipping: "shipping",
  paymentMethods: "payment_methods",
  promoBanner: "promo_banner",
  social: "social",
  contact: "contact",
  theme: "theme",
  typography: "typography",
  homeContent: "home_content",
} as const

export type SettingsKey = (typeof SETTINGS_KEYS)[keyof typeof SETTINGS_KEYS]
