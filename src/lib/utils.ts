import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { locale } from "@/config/store.config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return `${locale.currencySymbol}${amount.toLocaleString(locale.dateLocale)}`
}
