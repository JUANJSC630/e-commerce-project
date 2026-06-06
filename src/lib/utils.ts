import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { locale as defaultLocale } from "@/config/store.config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Minimal locale shape needed to format a monetary amount. */
export type PriceLocale = { currencySymbol: string; dateLocale: string }

/**
 * Formats a monetary amount. Pass the active locale (from settings) to honor
 * admin-configured currency; defaults to the static config for back-compat.
 */
export function formatPrice(amount: number, loc: PriceLocale = defaultLocale): string {
  return `${loc.currencySymbol}${amount.toLocaleString(loc.dateLocale)}`
}
